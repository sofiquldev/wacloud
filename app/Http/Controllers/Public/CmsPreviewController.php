<?php

namespace App\Http\Controllers\Public;

use App\Cms\CmsSettingKey;
use App\Http\Controllers\Controller;
use App\Models\CmsSetting;
use App\Support\CmsContentRepository;
use App\Support\InnerPageSidebarResolver;
use App\Support\SiteSettingsRepository;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CmsPreviewController extends Controller
{
    public function page(string $slug): Response
    {
        return $this->renderInnerPage('page', $slug, '/p/'.$slug, 'page');
    }

    public function service(string $slug): Response
    {
        return $this->renderInnerPage('service', $slug, '/services/'.$slug, 'service');
    }

    public function notice(string $slug): Response
    {
        return $this->renderInnerPage('notice', $slug, '/notices/'.$slug, 'notice');
    }

    private function renderInnerPage(string $kind, string $slug, string $canonicalPath, string $contentKind): Response
    {
        $site = app(SiteSettingsRepository::class)->forPublic();
        $base = $site['appTitleEn'] ?? config('app.name');
        $loaded = $this->loadCmsBodyForSlug($slug, $contentKind);
        $resolved = app(InnerPageSidebarResolver::class)->resolve($loaded['templateId']);

        return Inertia::render('Public/CmsStub', [
            'kind' => $kind,
            'slug' => $slug,
            'title' => $loaded['title'],
            'contentHtml' => $loaded['contentHtml'],
            'layoutTemplate' => $resolved['columnLayout'],
            'innerPageWidgets' => [
                'left' => $resolved['left'],
                'right' => $resolved['right'],
            ],
            'seo' => [
                'title' => $loaded['title'].' — '.$base,
                'description' => null,
                'keywords' => null,
                'canonical' => url($canonicalPath),
            ],
        ]);
    }

    /**
     * Loads the page body. The raw `layoutTemplate` value can be either a saved
     * template id (`tpl-*`) or a legacy column-layout id (`content-right`,
     * `full`, ...); both are preserved for the resolver to interpret.
     *
     * @return array{title: string, contentHtml: ?string, templateId: ?string}
     */
    private function loadCmsBodyForSlug(string $slug, ?string $kind = 'page'): array
    {
        $title = Str::headline(str_replace('-', ' ', $slug));
        $contentHtml = null;
        $templateId = null;

        if (in_array($kind, ['notice', 'service'], true)) {
            $row = app(CmsContentRepository::class)->findBySlug($kind, $slug);
            if ($row !== null) {
                $title = (string) ($row['title'] ?? $title);
                $body = trim((string) ($row['body'] ?? ''));
                if ($body !== '') {
                    $contentHtml = Str::markdown($body, ['html_input' => 'strip']);
                }
                $tpl = (string) ($row['template'] ?? '');
                if ($tpl !== '' && str_starts_with($tpl, 'tpl-')) {
                    $templateId = $tpl;
                }

                return [
                    'title' => $title,
                    'contentHtml' => $contentHtml,
                    'templateId' => $templateId,
                ];
            }
        }

        if (Schema::hasTable('cms_settings')) {
            $row = CmsSetting::query()->find(CmsSettingKey::CMS_PAGE_BODIES);
            $payload = $row?->payload;
            $entry = is_array($payload) && isset($payload[$slug]) && is_array($payload[$slug])
                ? $payload[$slug]
                : null;
            if ($entry !== null) {
                if (isset($entry['title']) && is_string($entry['title']) && trim($entry['title']) !== '') {
                    $title = trim($entry['title']);
                }
                if (isset($entry['body']) && is_string($entry['body']) && trim($entry['body']) !== '') {
                    $contentHtml = Str::markdown(trim($entry['body']), [
                        'html_input' => 'strip',
                    ]);
                }
                $raw = isset($entry['layoutTemplate']) && is_string($entry['layoutTemplate'])
                    ? trim($entry['layoutTemplate'])
                    : '';
                if ($raw !== '' && str_starts_with($raw, 'tpl-')) {
                    $templateId = $raw;
                }
            }
        }

        return [
            'title' => $title,
            'contentHtml' => $contentHtml,
            'templateId' => $templateId,
        ];
    }
}
