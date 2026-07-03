<?php

namespace App\Support;

use App\Models\Member;
use Illuminate\Support\Facades\Schema;

/**
 * Resolves the inner page rail for /p/* and /services/* pages from the saved
 * "Inner page" template (kind=inner-page). If the template has no widgets,
 * a sensible default (mayor profile + hotline + notice strip) is supplied so
 * pages always render with content next to the article.
 */
final class InnerPageSidebarResolver
{
    /** Same default portrait as `resources/js/data/widgetPeopleDirectory.js`. */

    public function __construct(
        private MemberWidgetMessageEnricher $enricher,
        private HomepageWidgetLayoutRepository $repository,
    ) {}

    /**
     * Resolve the layout + sidebar widgets for an inner page.
     *
     * When the page (or service) has saved a specific template id (e.g. picked
     * from the editor's Template dropdown), that template is used. Otherwise the
     * saved "Inner page" role template is used. If neither has any widgets, a
     * default right rail (mayor card + hotline + notice strip) is provided.
     *
     * @return array{
     *     columnLayout: string,
     *     left: array<int, array<string, mixed>>,
     *     right: array<int, array<string, mixed>>,
     * }
     */
    public function resolve(?string $templateId = null): array
    {
        $payload = $this->loadPayload();
        $tpl = null;
        if (is_string($templateId) && $templateId !== '' && str_starts_with($templateId, 'tpl-')) {
            $tpl = $this->enricher->resolveTemplateById($payload, $templateId);
        }
        if ($tpl === null) {
            $tpl = $this->enricher->resolveTemplateForRole($payload, 'inner-page');
        }

        $columnLayout = CmsPageLayout::normalize($tpl['columnLayout'] ?? null);
        $widgets = $this->enricher->resolveWidgetsForTemplate($payload, $tpl);

        $byPosition = ['left' => [], 'main' => [], 'right' => []];
        foreach ($widgets as $w) {
            $pos = is_array($w) ? ($w['position'] ?? 'main') : 'main';
            if (! isset($byPosition[$pos])) {
                $pos = 'main';
            }
            $byPosition[$pos][] = $w;
        }

        if ($byPosition['left'] === [] && $byPosition['right'] === []) {
            $byPosition['right'] = $this->defaultRightRailWidgets();
        }

        return [
            'columnLayout' => $columnLayout,
            'left' => array_values($byPosition['left']),
            'right' => array_values($byPosition['right']),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function loadPayload(): ?array
    {
        try {
            return $this->repository->load();
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    /**
     * Default sidebar when no template widgets are configured: mayor card +
     * hotline + notice strip pulled from the default homepage widget JSON.
     *
     * @return array<int, array<string, mixed>>
     */
    private function defaultRightRailWidgets(): array
    {
        $fileWidgets = $this->enricher->defaultHomepageWidgetsFromFile();

        $widgets = [];
        $profile = $this->defaultProfileCardWidget();
        if ($profile !== null) {
            $widgets[] = $profile;
        }
        foreach ($fileWidgets as $w) {
            if (! is_array($w)) {
                continue;
            }
            if (($w['type'] ?? '') === 'hotline') {
                $widgets[] = [
                    'type' => 'hotline',
                    'position' => 'right',
                    'data' => is_array($w['data'] ?? null) ? $w['data'] : [],
                ];
                break;
            }
        }
        foreach ($fileWidgets as $w) {
            if (! is_array($w)) {
                continue;
            }
            if (($w['type'] ?? '') === 'notice-list') {
                $data = is_array($w['data'] ?? null) ? $w['data'] : [];
                $items = is_array($data['items'] ?? null) ? $data['items'] : [];
                $data['items'] = array_slice(array_values(array_filter($items, 'is_array')), 0, 5);
                $widgets[] = [
                    'type' => 'notice-list',
                    'position' => 'right',
                    'data' => $data,
                ];
                break;
            }
        }

        return $widgets;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function defaultProfileCardWidget(): ?array
    {
        if (! Schema::hasTable('members')) {
            return null;
        }
        try {
            $mayor = Member::query()
                ->where('status', 'active')
                ->whereRaw('LOWER(TRIM(designation)) = ?', ['mayor'])
                ->orderBy('id')
                ->first();
            if ($mayor === null) {
                $mayor = Member::query()->where('status', 'active')->orderBy('id')->first();
            }
            if ($mayor === null) {
                return null;
            }
            $row = $this->enricher->memberToDirectoryRow($mayor);
            $msg = trim((string) ($row['publicMessage'] ?? ''));
            $showMessages = $msg !== '';
            $designation = (string) ($row['designation'] ?? '');
            $cta = str_contains(strtolower($designation), 'mayor') ? 'Message from Mayor' : 'View profile';

            return [
                'type' => 'member-card',
                'position' => 'right',
                'data' => [
                    'name' => (string) ($row['name'] ?? ''),
                    'designation' => $designation,
                    'ward' => (string) ($row['ward'] ?? ''),
                    'photo' => $row['photoUrl'] ?? DefaultMemberPhoto::url(),
                    'quote' => $showMessages ? $msg : '',
                    'message' => $showMessages ? $msg : '',
                    'ctaLabel' => $cta,
                    'showMessages' => $showMessages,
                ],
            ];
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }
}
