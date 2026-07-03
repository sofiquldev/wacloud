<?php

namespace App\Support;

use App\Cms\CmsSettingKey;
use App\Models\CmsSetting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Page catalog for nav validation and admin pickers. Returns config cms_content.pages
 * until cms_pages_catalog is seeded, then the DB catalog (full list).
 */
final class CmsContentCatalog
{
    /**
     * Rows for the admin Pages list / ContentEdit, built from {@see self::pages()} plus optional
     * markdown bodies stored under {@see CmsSettingKey::CMS_PAGE_BODIES}.
     *
     * @return array<int, array<string, mixed>>
     */
    public function adminPagesForManager(): array
    {
        $catalog = $this->pages();
        $bodies = $this->pageBodiesBySlug();
        $cats = config('cms_catalog.pageCategories', []);
        $defaultCategory = is_array($cats) && $cats !== [] ? (string) reset($cats) : 'Council';

        $out = [];
        foreach ($catalog as $row) {
            if (! is_array($row)) {
                continue;
            }
            $slug = trim((string) ($row['slug'] ?? ''));
            if ($slug === '') {
                continue;
            }
            $id = $row['id'] ?? null;
            if (! is_int($id) && ! (is_string($id) && ctype_digit($id))) {
                $id = abs(crc32($slug)) % 2_147_000_000;
            } else {
                $id = (int) $id;
            }
            $title = trim((string) ($row['title'] ?? $slug));
            $block = $bodies[$slug] ?? null;
            $body = '';
            $layout = 'tpl-inner-page';
            $displayTitle = $title;
            if (is_array($block)) {
                $displayTitle = trim((string) ($block['title'] ?? '')) ?: $title;
                $body = (string) ($block['body'] ?? '');
                $layout = trim((string) ($block['layoutTemplate'] ?? '')) ?: 'tpl-inner-page';
            }
            $plain = preg_replace('/\s+/', ' ', trim(strip_tags($body))) ?? '';
            $excerpt = $plain !== '' ? Str::limit($plain, 160, '…') : Str::limit($displayTitle, 120, '…');

            $out[] = [
                'id' => $id,
                'title' => $displayTitle,
                'slug' => $slug,
                'status' => $plain !== '' ? 'published' : 'draft',
                'category' => (string) ($row['category'] ?? $defaultCategory),
                'excerpt' => $excerpt,
                'body' => $body,
                'updatedAt' => now()->toDateString(),
                'template' => $this->mapCmsPageLayoutToEditorTemplate($layout),
            ];
        }

        return $out;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function pageBodiesBySlug(): array
    {
        if (! Schema::hasTable('cms_settings')) {
            return [];
        }
        $row = CmsSetting::query()->find(CmsSettingKey::CMS_PAGE_BODIES);
        $payload = $row?->payload;

        return is_array($payload) ? $payload : [];
    }

    private function mapCmsPageLayoutToEditorTemplate(string $layoutId): string
    {
        if (str_starts_with($layoutId, 'tpl-')) {
            return $layoutId;
        }

        return match ($layoutId) {
            'full' => 'full-width',
            'content-left', 'three-column' => 'sidebar',
            default => 'default',
        };
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function pages(): array
    {
        $base = config('cms_content.pages', []);
        if (! Schema::hasTable('cms_settings')) {
            return $base;
        }

        $row = CmsSetting::query()->find(CmsSettingKey::CMS_PAGES_CATALOG);
        $payload = $row?->payload;
        $extra = is_array($payload) && isset($payload['pages']) && is_array($payload['pages'])
            ? $payload['pages']
            : [];

        if ($extra === []) {
            return $base;
        }

        return $this->mergePageCatalogRows($base, $extra);
    }

    /**
     * @param  array<int, array<string, mixed>>  $base
     * @param  array<int, array<string, mixed>>  $fromDb
     * @return array<int, array<string, mixed>>
     */
    private function mergePageCatalogRows(array $base, array $fromDb): array
    {
        $bySlug = [];
        foreach ($base as $row) {
            if (is_array($row) && isset($row['slug']) && is_string($row['slug']) && $row['slug'] !== '') {
                $bySlug[$row['slug']] = $row;
            }
        }
        foreach ($fromDb as $row) {
            if (is_array($row) && isset($row['slug']) && is_string($row['slug']) && $row['slug'] !== '') {
                $slug = $row['slug'];
                $bySlug[$slug] = array_merge($bySlug[$slug] ?? [], $row);
            }
        }

        return collect($bySlug)->sortKeys()->values()->all();
    }

    /**
     * Markdown body + title for a CMS page slug (from {@see CmsSettingKey::CMS_PAGE_BODIES} + catalog titles).
     *
     * @return array{title: string, bodyMarkdown: string}
     */
    public function pageMarkdownSourceForSlug(string $slug): array
    {
        $slug = trim($slug);
        $title = $slug !== '' ? Str::headline(str_replace('-', ' ', $slug)) : '';
        foreach ($this->pages() as $row) {
            if (! is_array($row)) {
                continue;
            }
            if (($row['slug'] ?? '') === $slug) {
                $title = trim((string) ($row['title'] ?? $title)) ?: $title;

                break;
            }
        }
        $bodies = $this->pageBodiesBySlug();
        $entry = isset($bodies[$slug]) && is_array($bodies[$slug]) ? $bodies[$slug] : null;
        $bodyMd = '';
        if ($entry !== null) {
            if (isset($entry['title']) && is_string($entry['title']) && trim($entry['title']) !== '') {
                $title = trim($entry['title']);
            }
            $bodyMd = (string) ($entry['body'] ?? '');
        }

        return ['title' => $title, 'bodyMarkdown' => $bodyMd];
    }

    /**
     * @return list<string>
     */
    public function pageSlugs(): array
    {
        return collect($this->pages())->pluck('slug')->filter()->map(fn ($s) => (string) $s)->unique()->values()->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function services(): array
    {
        return app(CmsContentRepository::class)->services();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function notices(): array
    {
        return app(CmsContentRepository::class)->notices();
    }

    /**
     * @return list<string>
     */
    public function serviceSlugs(): array
    {
        return collect($this->services())->pluck('slug')->filter()->map(fn ($s) => (string) $s)->unique()->values()->all();
    }
}
