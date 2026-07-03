<?php

namespace App\Support;

/**
 * Validates {@see layoutTemplate} values stored on CMS page body records.
 */
final class CmsPageLayout
{
    /**
     * @return list<string>
     */
    public static function allowedIds(): array
    {
        return collect(config('cms_page_layouts.templates', []))
            ->pluck('id')
            ->filter(fn ($id) => is_string($id) && $id !== '')
            ->values()
            ->all();
    }

    public static function normalize(?string $layout): string
    {
        $allowed = self::allowedIds();
        $fallback = (string) config('cms_page_layouts.default', 'content-right');
        if (is_string($layout) && in_array($layout, $allowed, true)) {
            return $layout;
        }
        if (in_array($fallback, $allowed, true)) {
            return $fallback;
        }

        return 'content-right';
    }
}
