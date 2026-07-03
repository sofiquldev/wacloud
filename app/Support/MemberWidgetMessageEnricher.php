<?php

namespace App\Support;

use App\Models\Member;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class MemberWidgetMessageEnricher
{

    /**
     * @param  array<int, array<string, mixed>>  $widgets
     * @return array<int, array<string, mixed>>
     */
    public function enrichWidgetList(array $widgets): array
    {
        $widgets = array_map(fn (array $w) => $this->enrichNavServicesWidget($w), $widgets);

        if (Schema::hasTable('members')) {
            $activeMembers = Member::query()->where('status', 'active')->get();
            $widgets = array_map(function (array $w) use ($activeMembers) {
                if (($w['type'] ?? '') !== 'member-card') {
                    return $w;
                }
                $data = is_array($w['data'] ?? null) ? $w['data'] : [];
                $displayName = (string) ($data['name'] ?? '');
                $match = $activeMembers->first(
                    fn (Member $m) => $this->namesLooselyMatch($displayName, (string) $m->name),
                );
                if ($match !== null) {
                    $row = $this->memberToDirectoryRow($match);
                    $data['name'] = $row['name'];
                    $data['designation'] = $row['designation'];
                    $data['ward'] = $row['ward'] ?? '';
                    $data['photo'] = $row['photoUrl'] ?? DefaultMemberPhoto::url();
                    $msg = trim((string) ($row['publicMessage'] ?? ''));
                    if ($msg !== '') {
                        $data['message'] = $msg;
                    }
                } else {
                    $merged = $this->findPublicMessage(
                        $displayName,
                        (string) ($data['designation'] ?? ''),
                        $activeMembers,
                    );
                    if ($merged !== null) {
                        $data['message'] = $merged;
                    }
                }

                return array_merge($w, ['data' => $data]);
            }, $widgets);
        }

        return array_map(fn (array $w) => $this->enrichContentWidget($w), $widgets);
    }

    /**
     * @param  array<string, mixed>  $w
     * @return array<string, mixed>
     */
    private function enrichContentWidget(array $w): array
    {
        if (($w['type'] ?? '') !== 'content') {
            return $w;
        }
        $data = is_array($w['data'] ?? null) ? $w['data'] : [];
        $source = ($data['source'] ?? '') === 'page' ? 'page' : 'manual';
        $slug = trim((string) ($data['pageSlug'] ?? ''));
        $heading = trim((string) ($data['title'] ?? ''));

        $bodyMarkdown = '';
        if ($source === 'page' && $slug !== '') {
            $src = app(CmsContentCatalog::class)->pageMarkdownSourceForSlug($slug);
            if ($heading === '') {
                $heading = (string) ($src['title'] ?? '');
            }
            $bodyMarkdown = (string) ($src['bodyMarkdown'] ?? '');
        } else {
            $bodyMarkdown = (string) ($data['body'] ?? '');
        }

        $bodyHtml = '';
        if (trim($bodyMarkdown) !== '') {
            $bodyHtml = Str::markdown(trim($bodyMarkdown), [
                'html_input' => 'strip',
            ]);
        }

        if ($heading === '') {
            $heading = 'Content';
        }

        $data = array_merge($data, [
            'title' => $heading,
            'bodyHtml' => $bodyHtml,
            'attachments' => $this->normalizeContentAttachments($data['attachments'] ?? []),
        ]);

        return array_merge($w, ['data' => $data]);
    }

    /**
     * @param  mixed  $raw
     * @return list<array{label: string, url: string, size: string}>
     */
    private function normalizeContentAttachments(mixed $raw): array
    {
        if (! is_array($raw)) {
            return [];
        }
        $out = [];
        foreach ($raw as $row) {
            if (! is_array($row)) {
                continue;
            }
            $label = trim((string) ($row['label'] ?? ''));
            $url = trim((string) ($row['url'] ?? ''));
            $size = trim((string) ($row['size'] ?? ''));
            if ($url === '' && $label === '') {
                continue;
            }
            $out[] = ['label' => $label !== '' ? $label : $url, 'url' => $url, 'size' => $size];
            if (count($out) >= 30) {
                break;
            }
        }

        return $out;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Member>  $members
     */
    private function findPublicMessage(string $displayName, string $designation, $members): ?string
    {
        $des = trim($designation);
        $matches = $members->filter(fn (Member $m) => $this->namesLooselyMatch($displayName, (string) $m->name));
        $withMsg = $matches->filter(fn (Member $m) => trim((string) $m->public_message) !== '');
        if ($withMsg->isEmpty()) {
            return null;
        }
        $exact = $withMsg->first(fn (Member $m) => $des === '' || $m->designation === $des);
        $pick = $exact ?? $withMsg->first();

        return trim((string) $pick->public_message);
    }

    private function namesLooselyMatch(string $displayName, string $directoryName): bool
    {
        $a = $this->normName($displayName);
        $b = $this->normName($directoryName);
        if ($a === '' || $b === '') {
            return false;
        }
        if ($a === $b) {
            return true;
        }
        $ta = implode(' ', array_slice(explode(' ', $a), 0, 3));
        $tb = implode(' ', array_slice(explode(' ', $b), 0, 3));

        return $ta === $tb || str_contains($a, $tb) || str_contains($b, $ta);
    }

    private function normName(string $s): string
    {
        $s = strtolower(trim(preg_replace('/\s+/', ' ', $s) ?? ''));

        return $s;
    }

    /**
     * @param  array<string, mixed>  $w
     * @return array<string, mixed>
     */
    private function enrichNavServicesWidget(array $w): array
    {
        if (($w['type'] ?? '') !== 'nav-services') {
            return $w;
        }
        $data = is_array($w['data'] ?? null) ? $w['data'] : [];
        $source = $data['serviceSource'] ?? 'catalog';
        if ($source !== 'catalog') {
            return $w;
        }
        $q = is_array($data['serviceQuery'] ?? null) ? $data['serviceQuery'] : [];
        $data['items'] = $this->buildNavServiceItemsFromCatalog($q);

        return array_merge($w, ['data' => $data]);
    }

    /**
     * @param  array<string, mixed>  $q
     * @return array<int, array<string, mixed>>
     */
    private function buildNavServiceItemsFromCatalog(array $q): array
    {
        $mode = in_array($q['mode'] ?? 'all', ['all', 'include', 'exclude'], true) ? $q['mode'] : 'all';
        $limit = min(50, max(1, (int) ($q['limit'] ?? 8)));
        $include = array_values(array_filter($q['includeSlugs'] ?? [], fn ($s) => is_string($s) && trim($s) !== ''));
        $exclude = array_values(array_filter($q['excludeSlugs'] ?? [], fn ($s) => is_string($s) && trim($s) !== ''));

        $services = app(CmsContentCatalog::class)->services();
        $rows = [];
        foreach ($services as $s) {
            if (! is_array($s)) {
                continue;
            }
            $slug = trim((string) ($s['slug'] ?? ''));
            if ($slug === '') {
                continue;
            }
            if ($mode === 'exclude' && $exclude !== [] && in_array($slug, $exclude, true)) {
                continue;
            }
            if ($mode === 'include' && $include !== [] && ! in_array($slug, $include, true)) {
                continue;
            }
            $rows[] = [
                'id' => (int) ($s['id'] ?? 0) ?: crc32($slug),
                'slug' => $slug,
                'label' => (string) ($s['title'] ?? $slug),
                'href' => '/services/'.$slug,
            ];
        }

        if ($mode === 'include' && $include !== []) {
            $bySlug = [];
            foreach ($rows as $r) {
                $bySlug[$r['slug']] = $r;
            }
            $ordered = [];
            foreach ($include as $slug) {
                if (isset($bySlug[$slug])) {
                    $ordered[] = $bySlug[$slug];
                }
            }
            $rows = $ordered;
        }

        return array_slice($rows, 0, $limit);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function defaultHomepageWidgetsFromFile(): array
    {
        $path = resource_path('data/homepage_widgets_default.json');
        if (! File::exists($path)) {
            return [];
        }
        $decoded = json_decode(File::get($path), true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @param  array<string, mixed>  $template
     * @return array<int, array<string, mixed>>
     */
    public function templateToHomepageWidgets(array $template): array
    {
        $out = [];
        $zones = $template['zones'] ?? [];
        $instances = $template['instances'] ?? [];
        if (! is_array($zones) || ! is_array($instances)) {
            return [];
        }
        foreach (['left', 'main', 'right'] as $zone) {
            $list = $zones[$zone] ?? [];
            if (! is_array($list)) {
                continue;
            }
            foreach ($list as $id) {
                $inst = $instances[$id] ?? null;
                if (! is_array($inst)) {
                    continue;
                }
                $type = $inst['type'] ?? '';
                $data = $inst['data'] ?? [];
                if (! is_array($data)) {
                    $data = [];
                }
                if ($type === 'members-grid' && isset($inst['membersGrid']) && is_array($inst['membersGrid'])) {
                    $data['membersGrid'] = $inst['membersGrid'];
                }
                $out[] = [
                    'type' => $type,
                    'position' => $zone,
                    'data' => $data,
                ];
            }
        }

        return $out;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function resolvePublicHomepageWidgets(?array $layoutPayload): array
    {
        $widgets = $this->defaultHomepageWidgetsFromFile();
        $tpl = $this->resolveTemplateForRole($layoutPayload, 'homepage');
        if ($tpl !== null && is_array($layoutPayload)) {
            $converted = $this->templateToHomepageWidgets($tpl);
            if ($converted !== []) {
                $widgets = $converted;
            }
        }

        $widgets = $this->hydrateMembersGridWidgetsFromDatabase($widgets);

        return $this->enrichWidgetList($widgets);
    }

    /**
     * Full enriched widget list (with members-grid hydration + nav-services catalog
     * + member-card directory lookup) for the saved "Inner page" template. Returns
     * an empty list if the template is missing or has no widgets.
     *
     * @return array<int, array<string, mixed>>
     */
    public function resolveInnerPageWidgets(?array $layoutPayload): array
    {
        $tpl = $this->resolveTemplateForRole($layoutPayload, 'inner-page');

        return $this->resolveWidgetsForTemplate($layoutPayload, $tpl);
    }

    /**
     * Full enriched widget list for an arbitrary template (e.g. one picked per
     * page via the Template dropdown). Falls back to an empty list when the
     * template has no widgets or is missing.
     *
     * @param  array<string, mixed>|null  $template
     * @return array<int, array<string, mixed>>
     */
    public function resolveWidgetsForTemplate(?array $layoutPayload, ?array $template): array
    {
        if ($template === null) {
            return [];
        }
        $widgets = $this->templateToHomepageWidgets($template);
        if ($widgets === []) {
            return [];
        }
        $widgets = $this->hydrateMembersGridWidgetsFromDatabase($widgets);

        return $this->enrichWidgetList($widgets);
    }

    /**
     * Look up a saved template by id (e.g. `tpl-inner-page`).
     *
     * @return array<string, mixed>|null
     */
    public function resolveTemplateById(?array $layoutPayload, string $id): ?array
    {
        if (
            $id === ''
            || ! is_array($layoutPayload)
            || empty($layoutPayload['templates'])
            || ! is_array($layoutPayload['templates'])
        ) {
            return null;
        }
        foreach ($layoutPayload['templates'] as $tpl) {
            if (is_array($tpl) && ($tpl['id'] ?? '') === $id) {
                return $tpl;
            }
        }

        return null;
    }

    /**
     * Find the saved template that should drive a given role. Prefers a template
     * whose `kind` matches, then the active template, then the first template.
     *
     * @return array<string, mixed>|null
     */
    public function resolveTemplateForRole(?array $layoutPayload, string $role): ?array
    {
        if (
            ! is_array($layoutPayload)
            || empty($layoutPayload['templates'])
            || ! is_array($layoutPayload['templates'])
        ) {
            return null;
        }
        $templates = array_values(array_filter($layoutPayload['templates'], 'is_array'));
        foreach ($templates as $tpl) {
            if (($tpl['kind'] ?? null) === $role) {
                return $tpl;
            }
        }
        $activeId = (string) ($layoutPayload['activeTemplateId'] ?? '');
        if ($activeId !== '') {
            foreach ($templates as $tpl) {
                if (($tpl['id'] ?? '') === $activeId) {
                    return $tpl;
                }
            }
        }

        return $templates[0] ?? null;
    }

    /**
     * Replace static members-grid rows with active members from the database (respects saved membersGrid filters).
     *
     * @param  array<int, array<string, mixed>>  $widgets
     * @return array<int, array<string, mixed>>
     */
    private function hydrateMembersGridWidgetsFromDatabase(array $widgets): array
    {
        if (! Schema::hasTable('members')) {
            return $widgets;
        }

        try {
            $catalog = app(CmsCatalogResolver::class)->merged();
        } catch (\Throwable $e) {
            report($e);
            $catalog = config('cms_catalog', []);
        }
        $sessions = is_array($catalog['sessions'] ?? null) ? $catalog['sessions'] : [];

        return array_map(function (array $w) use ($sessions) {
            if (($w['type'] ?? '') !== 'members-grid') {
                return $w;
            }
            $data = is_array($w['data'] ?? null) ? $w['data'] : [];
            $membersGrid = is_array($data['membersGrid'] ?? null) ? $data['membersGrid'] : [];
            $rows = $this->buildMembersGridPublicRows($membersGrid, $sessions);
            $data['members'] = $rows;
            $fallbackSession = (string) ($data['sessionLabel'] ?? '');
            $data['sessionLabel'] = $this->resolveMembersGridSessionLabel($rows, $sessions, $fallbackSession);
            unset($data['membersGrid']);

            return array_merge($w, ['data' => $data]);
        }, $widgets);
    }

    /**
     * @param  array<string, mixed>  $membersGrid
     * @param  array<int, mixed>  $sessions
     * @return array<int, array<string, mixed>>
     */
    private function buildMembersGridPublicRows(array $membersGrid, array $sessions): array
    {
        $group = $membersGrid['group'] ?? 'all';
        $group = is_string($group) ? $group : 'all';
        if (! in_array($group, ['all', 'mayor', 'panel-mayor', 'councilors', 'reserved', 'officers'], true)) {
            $group = 'all';
        }
        $includeIds = is_array($membersGrid['includeIds'] ?? null) ? $membersGrid['includeIds'] : [];
        $excludeIds = is_array($membersGrid['excludeIds'] ?? null) ? $membersGrid['excludeIds'] : [];

        $all = Member::query()->where('status', 'active')->orderBy('name')->get();
        $list = $all->filter(fn (Member $m) => $this->memberMatchesMembersGridGroup($m, $group))->values();

        foreach ($includeIds as $rawId) {
            if (! is_string($rawId) && ! is_int($rawId)) {
                continue;
            }
            $memberId = $this->parseWidgetPersonRefToMemberId((string) $rawId);
            if ($memberId === null) {
                continue;
            }
            $m = $all->firstWhere('id', $memberId);
            if ($m !== null && ! $list->contains(fn (Member $x) => $x->id === $m->id)) {
                $list = collect([$m])->merge($list);
            }
        }

        $excludeIdSet = [];
        foreach ($excludeIds as $rawId) {
            if (! is_string($rawId) && ! is_int($rawId)) {
                continue;
            }
            $mid = $this->parseWidgetPersonRefToMemberId((string) $rawId);
            if ($mid !== null) {
                $excludeIdSet[$mid] = true;
            }
        }

        $list = $list->filter(fn (Member $m) => ! isset($excludeIdSet[$m->id]))->values();

        $rows = [];
        foreach ($list as $member) {
            $rows[] = $this->memberToMembersGridRow($member, $sessions);
        }

        return $rows;
    }

    private function parseWidgetPersonRefToMemberId(string $ref): ?int
    {
        $ref = trim($ref);
        if ($ref === '') {
            return null;
        }
        if (preg_match('/^m-(\d+)$/i', $ref, $m)) {
            return (int) $m[1];
        }
        if (preg_match('/^\d+$/', $ref)) {
            return (int) $ref;
        }

        return null;
    }

    /**
     * Mirrors `resources/js/data/widgetPeopleDirectory.js` group filters (role ≈ designation).
     */
    private function memberMatchesMembersGridGroup(Member $member, string $group): bool
    {
        if ($group === 'all') {
            return true;
        }
        $d = trim((string) $member->designation);
        $lower = mb_strtolower($d);

        return match ($group) {
            'mayor' => strcasecmp($d, 'Mayor') === 0,
            'panel-mayor' => str_starts_with($lower, 'panel mayor'),
            'councilors' => (bool) preg_match('/councill?or/i', $d) && ! str_contains($lower, 'reserved'),
            'reserved' => str_contains($lower, 'reserved'),
            'officers' => str_contains($lower, 'chief executive') || str_contains($lower, 'officer'),
            default => true,
        };
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @param  array<int, mixed>  $sessions
     */
    private function resolveMembersGridSessionLabel(array $rows, array $sessions, string $fallback): string
    {
        if ($rows === []) {
            return $fallback;
        }
        $ids = collect($rows)->pluck('sessionId')->filter()->unique()->values();
        if ($ids->count() === 1) {
            $sid = (string) $ids[0];
            foreach ($sessions as $s) {
                if (is_array($s) && (string) ($s['id'] ?? '') === $sid) {
                    $label = trim((string) ($s['label'] ?? ''));

                    return $label !== '' ? $label : $fallback;
                }
            }
        }
        foreach ($sessions as $s) {
            if (is_array($s) && ($s['current'] ?? false) === true) {
                $label = trim((string) ($s['label'] ?? ''));

                return $label !== '' ? $label : $fallback;
            }
        }

        return $fallback;
    }

    /**
     * @param  array<int, mixed>  $sessions
     * @return array<string, mixed>
     */
    private function memberToMembersGridRow(Member $member, array $sessions): array
    {
        $meta = $this->sessionMetaForId((string) $member->session_id, $sessions);
        $photoUrl = app(MemberPhotoStorage::class)->publicUrl($member->photo_path);
        $ts = $meta['termStart'];
        $te = $meta['termEnd'];
        if ($ts === null || $te === null) {
            $ts = 2020;
            $te = 2025;
        }

        return [
            'id' => $member->id,
            'name' => $member->name,
            'designation' => $member->designation,
            'ward' => $member->ward ?? '',
            'photo' => $photoUrl ?? DefaultMemberPhoto::url(),
            'termStart' => $ts,
            'termEnd' => $te,
            'sessionId' => $member->session_id,
        ];
    }

    /**
     * @param  array<int, mixed>  $sessions
     * @return array{label: string, termStart: int|null, termEnd: int|null}
     */
    private function sessionMetaForId(string $sessionId, array $sessions): array
    {
        foreach ($sessions as $s) {
            if (! is_array($s)) {
                continue;
            }
            if ((string) ($s['id'] ?? '') !== $sessionId) {
                continue;
            }
            $label = (string) ($s['label'] ?? '');
            [$y1, $y2] = $this->parseYearSpanFromLabel($label);

            return [
                'label' => $label,
                'termStart' => $y1,
                'termEnd' => $y2,
            ];
        }

        return [
            'label' => '',
            'termStart' => null,
            'termEnd' => null,
        ];
    }

    /**
     * @return array{0: int|null, 1: int|null}
     */
    private function parseYearSpanFromLabel(string $label): array
    {
        if (preg_match('/(\d{4})\s*[—\-–]\s*(\d{4})/u', $label, $m)) {
            return [(int) $m[1], (int) $m[2]];
        }

        return [null, null];
    }

    /**
     * Column layout for the homepage template (matches {@see CmsPageLayout} ids).
     */
    public function resolvePublicHomepageColumnLayout(?array $layoutPayload): string
    {
        if (is_array($layoutPayload)) {
            $tpl = $this->resolveTemplateForRole($layoutPayload, 'homepage');
            if ($tpl !== null) {
                $raw = $tpl['columnLayout'] ?? null;

                return CmsPageLayout::normalize(is_string($raw) ? $raw : null);
            }
        }

        return 'three-column';
    }

    /**
     * @return array<string, mixed>
     */
    public function memberToDirectoryRow(Member $m): array
    {
        $photos = app(MemberPhotoStorage::class);
        $photoUrl = $photos->publicUrl($m->photo_path);

        return [
            'id' => $m->id,
            'name' => $m->name,
            'designation' => $m->designation,
            'ward' => $m->ward,
            'sessionId' => $m->session_id,
            'phone' => $m->phone,
            'email' => $m->email,
            'status' => $m->status,
            'publicMessage' => $m->public_message,
            'photoUrl' => $photoUrl ?? DefaultMemberPhoto::url(),
            'party' => $m->party,
        ];
    }
}
