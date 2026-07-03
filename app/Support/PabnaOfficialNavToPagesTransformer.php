<?php

namespace App\Support;

/**
 * Converts official pourashava placeholder custom links into internal {@see page} links.
 */
final class PabnaOfficialNavToPagesTransformer
{
    private const OFFICIAL_HOST = 'pabnapourashava.gov.bd';

    /**
     * @param  array<int, mixed>  $items
     * @return array<int, mixed>
     */
    public static function transformNavTree(array $items): array
    {
        $out = [];
        foreach ($items as $node) {
            if (! is_array($node)) {
                continue;
            }
            $childrenRaw = $node['children'] ?? [];
            $children = is_array($childrenRaw) && $childrenRaw !== []
                ? self::transformNavTree($childrenRaw)
                : [];

            $type = $node['linkType'] ?? 'section';
            if ($type === 'custom' && isset($node['customUrl']) && is_string($node['customUrl'])) {
                $slug = self::slugFromOfficialPlaceholderUrl($node['customUrl']);
                if ($slug !== null) {
                    $out[] = self::normalizedPageNode($node, $slug, $children);

                    continue;
                }
            }

            $out[] = array_merge($node, ['children' => $children]);
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<int, mixed>  $children
     * @return array<string, mixed>
     */
    private static function normalizedPageNode(array $node, string $slug, array $children): array
    {
        return [
            'label' => (string) ($node['label'] ?? ''),
            'linkType' => 'page',
            'pageSlug' => $slug,
            'serviceSlug' => null,
            'systemKey' => null,
            'customUrl' => null,
            'openNewTab' => (bool) ($node['openNewTab'] ?? false),
            'children' => $children,
        ];
    }

    public static function slugFromOfficialPlaceholderUrl(string $url): ?string
    {
        $url = trim($url);
        if ($url === '') {
            return null;
        }
        $host = parse_url($url, PHP_URL_HOST);
        if (! is_string($host) || ! str_contains(strtolower($host), self::OFFICIAL_HOST)) {
            return null;
        }
        $fragment = parse_url($url, PHP_URL_FRAGMENT);
        if (! is_string($fragment) || $fragment === '') {
            return null;
        }
        $fragment = trim($fragment);
        if (! preg_match('/^[A-Za-z0-9][A-Za-z0-9\-]*$/', $fragment)) {
            return null;
        }

        return $fragment;
    }

    /**
     * @param  array<int, mixed>  $items
     * @return list<array{slug: string, title: string}>
     */
    public static function collectPageCatalogFromNav(array $items): array
    {
        $seen = [];
        self::walk($items, $seen);

        return collect($seen)
            ->sortKeys()
            ->map(fn (string $title, string $slug) => ['slug' => $slug, 'title' => $title])
            ->values()
            ->all();
    }

    /**
     * @param  array<int, mixed>  $items
     * @param  array<string, string>  $seen
     */
    private static function walk(array $items, array &$seen): void
    {
        foreach ($items as $node) {
            if (! is_array($node)) {
                continue;
            }
            $type = $node['linkType'] ?? '';
            if ($type === 'page') {
                $slug = isset($node['pageSlug']) && is_string($node['pageSlug']) ? trim($node['pageSlug']) : '';
                if ($slug !== '') {
                    $label = trim((string) ($node['label'] ?? ''));
                    $seen[$slug] = $label !== '' ? $label : $slug;
                }
            }
            $children = $node['children'] ?? [];
            if (is_array($children) && $children !== []) {
                self::walk($children, $seen);
            }
        }
    }

    /**
     * @param  list<array{slug: string, title: string}>  $rows
     * @return array<string, array{title: string, body: string, layoutTemplate: string}>
     */
    public static function defaultBodiesForCatalog(array $rows): array
    {
        $out = [];
        foreach ($rows as $row) {
            $slug = $row['slug'];
            $title = $row['title'];
            $out[$slug] = [
                'title' => $title,
                'body' => "## {$title}\n\n_বিস্তারিত তথ্য শীঘ্রই যুক্ত করা হবে।_",
                'layoutTemplate' => 'tpl-inner-page',
            ];
        }

        return $out;
    }

    /**
     * @param  list<array{slug: string, title: string}>  $rows
     * @return array<int, array<string, mixed>>
     */
    public static function pagesPayloadRows(array $rows): array
    {
        $out = [];
        $id = 1;
        foreach ($rows as $row) {
            $out[] = [
                'id' => $id,
                'slug' => $row['slug'],
                'title' => $row['title'],
            ];
            $id++;
        }

        return $out;
    }
}
