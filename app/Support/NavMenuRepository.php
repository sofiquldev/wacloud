<?php

namespace App\Support;

use App\Cms\CmsSettingKey;
use App\Models\CmsSetting;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class NavMenuRepository
{
    public const NAV_DOCUMENT_DB_KEY = CmsSettingKey::NAV_MENU_DOCUMENT;

    private const STORAGE_NAME = 'nav_menu_header.json';

    public function defaultFilePath(): string
    {
        return resource_path('data/nav_menu_header.json');
    }

    public function storageFilePath(): string
    {
        return storage_path('app/'.self::STORAGE_NAME);
    }

    /**
     * @return array{version: int, items: array<int, mixed>}
     */
    public function loadDocument(): array
    {
        if (Schema::hasTable('cms_settings')) {
            $row = CmsSetting::query()->find(self::NAV_DOCUMENT_DB_KEY);
            $payload = $row?->payload;
            if (is_array($payload) && isset($payload['items']) && is_array($payload['items'])) {
                return [
                    'version' => (int) ($payload['version'] ?? 1),
                    'items' => $payload['items'],
                ];
            }
        }

        $storage = $this->storageFilePath();
        if (File::exists($storage)) {
            $decoded = json_decode(File::get($storage), true);
            if (is_array($decoded) && isset($decoded['items']) && is_array($decoded['items'])) {
                return [
                    'version' => (int) ($decoded['version'] ?? 1),
                    'items' => $decoded['items'],
                ];
            }
        }

        $default = $this->defaultFilePath();
        if (! File::exists($default)) {
            return ['version' => 1, 'items' => []];
        }
        $decoded = json_decode(File::get($default), true);
        if (! is_array($decoded) || ! isset($decoded['items']) || ! is_array($decoded['items'])) {
            return ['version' => 1, 'items' => []];
        }

        return [
            'version' => (int) ($decoded['version'] ?? 1),
            'items' => $decoded['items'],
        ];
    }

    /**
     * @param  array<int, mixed>  $items
     */
    public function saveItems(array $items): void
    {
        $normalized = $this->normalizeItemsForPersistence($items);
        $this->assertValidItemsForPersistence($normalized);

        $doc = ['version' => 1, 'items' => $normalized];

        if (Schema::hasTable('cms_settings')) {
            CmsSetting::query()->updateOrCreate(
                ['key' => self::NAV_DOCUMENT_DB_KEY],
                ['payload' => $doc],
            );

            return;
        }

        $path = $this->storageFilePath();
        $dir = dirname($path);
        if (! File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }
        $payload = json_encode(
            $doc,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
        );
        File::put($path, $payload);
    }

    /**
     * @param  array<int, mixed>  $items
     * @return array<int, mixed>
     */
    public function normalizeItemsForPersistence(array $items): array
    {
        return $this->normalizeItems($items);
    }

    /**
     * @param  array<int, mixed>  $items
     */
    public function assertValidItemsForPersistence(array $items): void
    {
        $this->assertValidItems($items);
    }

    /**
     * @param  array<int, mixed>  $items
     * @return array<int, mixed>
     */
    private function normalizeItems(array $items): array
    {
        $allowed = ['page', 'system', 'service', 'custom', 'section'];
        $out = [];
        foreach ($items as $node) {
            if (! is_array($node)) {
                continue;
            }
            $type = $node['linkType'] ?? 'section';
            if (! in_array($type, $allowed, true)) {
                $type = 'section';
            }
            $childrenRaw = $node['children'] ?? [];
            $children = is_array($childrenRaw) && $childrenRaw !== []
                ? $this->normalizeItems($childrenRaw)
                : [];

            $out[] = [
                'label' => trim((string) ($node['label'] ?? '')),
                'linkType' => $type,
                'pageSlug' => isset($node['pageSlug']) && is_string($node['pageSlug']) ? $node['pageSlug'] : null,
                'serviceSlug' => isset($node['serviceSlug']) && is_string($node['serviceSlug']) ? $node['serviceSlug'] : null,
                'systemKey' => isset($node['systemKey']) && is_string($node['systemKey']) ? $node['systemKey'] : null,
                'customUrl' => isset($node['customUrl']) && is_string($node['customUrl']) ? trim($node['customUrl']) : null,
                'openNewTab' => (bool) ($node['openNewTab'] ?? false),
                'children' => $children,
            ];
        }

        return $out;
    }

    /**
     * @return array{items: array<int, mixed>}
     */
    public function publicNav(): array
    {
        $doc = $this->loadDocument();

        return [
            'items' => $this->mapPublicNodes($doc['items'], ''),
        ];
    }

    /**
     * @param  array<int, mixed>  $nodes
     * @return array<int, mixed>
     */
    private function mapPublicNodes(array $nodes, string $pathPrefix): array
    {
        $out = [];
        foreach ($nodes as $index => $node) {
            if (! is_array($node)) {
                continue;
            }
            $key = $pathPrefix === '' ? (string) $index : $pathPrefix.'-'.$index;
            $href = $this->resolveHref($node);
            $real = $href !== '#' && $href !== '';

            $children = [];
            if (! empty($node['children']) && is_array($node['children'])) {
                $children = $this->mapPublicNodes($node['children'], $key);
            }

            $out[] = [
                'key' => $key,
                'label' => (string) ($node['label'] ?? ''),
                'href' => $href,
                'real' => $real,
                'openNewTab' => (bool) ($node['openNewTab'] ?? false),
                'children' => $children,
            ];
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $node
     */
    private function resolveHref(array $node): string
    {
        $type = $node['linkType'] ?? '';

        return match ($type) {
            'page' => $this->hrefForPage((string) ($node['pageSlug'] ?? '')),
            'service' => $this->hrefForService((string) ($node['serviceSlug'] ?? '')),
            'system' => $this->hrefForSystem((string) ($node['systemKey'] ?? '')),
            'custom' => $this->hrefForCustom((string) ($node['customUrl'] ?? '')),
            'section' => '#',
            default => '#',
        };
    }

    private function hrefForPage(string $slug): string
    {
        $slug = trim($slug);
        if ($slug === '') {
            return '#';
        }

        return route('public.page', ['slug' => $slug]);
    }

    private function hrefForService(string $slug): string
    {
        $slug = trim($slug);
        if ($slug === '') {
            return '#';
        }

        return route('public.service', ['slug' => $slug]);
    }

    private function hrefForSystem(string $key): string
    {
        $key = trim($key);
        foreach (config('cms_nav.system', []) as $row) {
            if (($row['key'] ?? '') === $key) {
                $path = (string) ($row['path'] ?? '#');
                $implemented = (bool) ($row['implemented'] ?? false);
                if (! $implemented) {
                    return '#';
                }

                return $path === '' ? '#' : $path;
            }
        }

        return '#';
    }

    private function hrefForCustom(string $url): string
    {
        $url = trim($url);
        if ($url === '') {
            return '#';
        }
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://') || str_starts_with($url, '/')) {
            return $url;
        }

        return '#';
    }

    /**
     * @param  array<int, mixed>  $items
     */
    private function assertValidItems(array $items, int $depth = 0, string $path = 'items'): void
    {
        if ($depth > 8) {
            throw ValidationException::withMessages([$path => 'Menu nesting is too deep (max 8 levels).']);
        }

        $pageSlugs = app(CmsContentCatalog::class)->pageSlugs();
        $serviceSlugs = app(CmsContentCatalog::class)->serviceSlugs();
        $systemKeys = collect(config('cms_nav.system', []))->pluck('key')->all();

        foreach ($items as $i => $node) {
            $here = "{$path}.{$i}";
            if (! is_array($node)) {
                throw ValidationException::withMessages([$here => 'Each menu entry must be an object.']);
            }

            $label = $node['label'] ?? null;
            if (! is_string($label) || trim($label) === '') {
                throw ValidationException::withMessages([$here.'.label' => 'Label is required.']);
            }
            if (strlen($label) > 255) {
                throw ValidationException::withMessages([$here.'.label' => 'Label is too long.']);
            }

            $type = $node['linkType'] ?? null;
            if (! in_array($type, ['page', 'system', 'service', 'custom', 'section'], true)) {
                throw ValidationException::withMessages([$here.'.linkType' => 'Invalid link type.']);
            }

            if (isset($node['openNewTab']) && ! is_bool($node['openNewTab'])) {
                throw ValidationException::withMessages([$here.'.openNewTab' => 'openNewTab must be boolean.']);
            }

            match ($type) {
                'page' => $this->requireSlugInList($node['pageSlug'] ?? null, $pageSlugs, $here.'.pageSlug'),
                'service' => $this->requireSlugInList($node['serviceSlug'] ?? null, $serviceSlugs, $here.'.serviceSlug'),
                'system' => $this->requireSlugInList($node['systemKey'] ?? null, $systemKeys, $here.'.systemKey'),
                'custom' => $this->requireNonEmpty($node['customUrl'] ?? null, $here.'.customUrl'),
                'section' => null,
            };

            $children = $node['children'] ?? [];
            if ($children !== [] && $children !== null) {
                if (! is_array($children)) {
                    throw ValidationException::withMessages([$here.'.children' => 'Children must be an array.']);
                }
                $this->assertValidItems($children, $depth + 1, $here.'.children');
            }
        }
    }

    /**
     * @param  array<int, string>  $allowed
     */
    private function requireSlugInList(mixed $value, array $allowed, string $key): void
    {
        $slug = is_string($value) ? trim($value) : '';
        if ($slug === '' || ! in_array($slug, $allowed, true)) {
            throw ValidationException::withMessages([$key => 'Invalid or missing reference.']);
        }
    }

    private function requireNonEmpty(mixed $value, string $key): void
    {
        $s = is_string($value) ? trim($value) : '';
        if ($s === '') {
            throw ValidationException::withMessages([$key => 'A URL is required for a custom link.']);
        }
        if (! str_starts_with($s, 'http://') && ! str_starts_with($s, 'https://') && ! str_starts_with($s, '/')) {
            throw ValidationException::withMessages([$key => 'URL must start with http(s):// or /.']);
        }
    }
}
