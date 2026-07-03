<?php

namespace App\Support;

use App\Cms\CmsSettingKey;
use App\Models\CmsSetting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Persists admin Notice and Service rows in cms_settings.
 */
final class CmsContentRepository
{
    public function __construct(
        private readonly CmsMediaStorage $media,
    ) {}

    /**
     * @return list<array<string, mixed>>
     */
    public function notices(): array
    {
        $rows = $this->loadCollection(CmsSettingKey::CMS_NOTICES);
        if ($rows !== []) {
            return $rows;
        }

        return [];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function services(): array
    {
        $rows = $this->loadCollection(CmsSettingKey::CMS_SERVICES);
        if ($rows !== []) {
            return $rows;
        }

        return $this->bootstrapServicesFromConfig();
    }

    public function find(string $kind, int $id): ?array
    {
        foreach ($this->collection($kind) as $row) {
            if ((int) ($row['id'] ?? 0) === $id) {
                return $this->normalizeRow($row, $kind);
            }
        }

        return null;
    }

    public function findBySlug(string $kind, string $slug): ?array
    {
        $slug = trim($slug);
        foreach ($this->collection($kind) as $row) {
            if ((string) ($row['slug'] ?? '') === $slug) {
                return $this->normalizeRow($row, $kind);
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public function upsert(string $kind, array $input): array
    {
        $collection = $this->collection($kind);
        $id = isset($input['id']) ? (int) $input['id'] : 0;
        $isNew = $id <= 0;
        if ($isNew) {
            $id = $this->nextId($collection);
        }

        $row = $this->normalizeRow(array_merge($input, ['id' => $id]), $kind);
        $row['updatedAt'] = now()->toDateString();
        $stored = $row;
        $stored['featuredImage'] = $row['featuredImagePath'] ?? $row['featuredImage'];
        unset($stored['featuredImagePath']);
        $stored['attachments'] = array_map(static function (array $att): array {
            unset($att['url']);

            return $att;
        }, $stored['attachments']);

        $found = false;
        foreach ($collection as $i => $existing) {
            if ((int) ($existing['id'] ?? 0) === $id) {
                $collection[$i] = $stored;
                $found = true;

                break;
            }
        }
        if (! $found) {
            $collection[] = $stored;
        }

        $this->saveCollection($kind, $collection);

        return $row;
    }

    public function nextIdFor(string $kind): int
    {
        return $this->nextId($this->collection($kind));
    }

    public function delete(string $kind, int $id): void
    {
        $collection = $this->collection($kind);
        $removed = null;
        $next = [];
        foreach ($collection as $row) {
            if ((int) ($row['id'] ?? 0) === $id) {
                $removed = $row;

                continue;
            }
            $next[] = $row;
        }
        if ($removed !== null) {
            $this->deleteRowMedia($removed);
            $this->saveCollection($kind, $next);
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function collection(string $kind): array
    {
        return match ($kind) {
            'notice' => $this->notices(),
            'service' => $this->services(),
            default => [],
        };
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function loadCollection(string $key): array
    {
        if (! Schema::hasTable('cms_settings')) {
            return [];
        }
        $payload = CmsSetting::query()->find($key)?->payload;

        return is_array($payload) ? array_values($payload) : [];
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     */
    private function saveCollection(string $kind, array $rows): void
    {
        if (! Schema::hasTable('cms_settings')) {
            return;
        }
        $key = match ($kind) {
            'notice' => CmsSettingKey::CMS_NOTICES,
            'service' => CmsSettingKey::CMS_SERVICES,
            default => null,
        };
        if ($key === null) {
            return;
        }
        CmsSetting::query()->updateOrCreate(
            ['key' => $key],
            ['payload' => array_values($rows)],
        );
    }

    /**
     * @param  list<array<string, mixed>>  $collection
     */
    private function nextId(array $collection): int
    {
        $max = 0;
        foreach ($collection as $row) {
            $max = max($max, (int) ($row['id'] ?? 0));
        }

        return $max + 1;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function bootstrapServicesFromConfig(): array
    {
        $config = config('cms_content.services', []);
        if (! is_array($config)) {
            return [];
        }
        $cats = config('cms_catalog.serviceCategories', []);
        $defaultCategory = is_array($cats) && $cats !== [] ? (string) reset($cats) : 'Citizen Records';
        $out = [];
        foreach ($config as $row) {
            if (! is_array($row)) {
                continue;
            }
            $slug = trim((string) ($row['slug'] ?? ''));
            if ($slug === '') {
                continue;
            }
            $id = (int) ($row['id'] ?? 0);
            if ($id <= 0) {
                $id = abs(crc32($slug)) % 2_147_000_000;
            }
            $title = trim((string) ($row['title'] ?? $slug));
            $out[] = $this->normalizeRow([
                'id' => $id,
                'title' => $title,
                'slug' => $slug,
                'status' => 'published',
                'category' => $defaultCategory,
                'template' => 'default',
                'excerpt' => Str::limit($title, 120, '…'),
                'body' => '',
                'attachments' => [],
                'featuredImage' => '',
                'tags' => [],
                'seoTitle' => '',
                'seoDescription' => '',
                'visibility' => 'public',
                'publishAt' => '',
                'updatedAt' => now()->toDateString(),
            ], 'service');
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function normalizeRow(array $row, string $kind): array
    {
        $attachments = [];
        foreach ((array) ($row['attachments'] ?? []) as $att) {
            if (! is_array($att)) {
                continue;
            }
            $path = isset($att['path']) ? (string) $att['path'] : '';
            $url = $path !== '' ? ($this->media->publicUrl($path) ?? '') : trim((string) ($att['url'] ?? ''));
            $attachments[] = [
                'id' => (string) ($att['id'] ?? Str::uuid()->toString()),
                'name' => (string) ($att['name'] ?? $att['label'] ?? 'File'),
                'size' => (int) ($att['size'] ?? 0),
                'mime' => (string) ($att['mime'] ?? 'application/octet-stream'),
                'path' => $path,
                'url' => $url,
            ];
        }

        $featuredRaw = trim((string) ($row['featuredImage'] ?? ''));
        $featured = $featuredRaw;
        if ($featuredRaw !== '' && str_starts_with($featuredRaw, CmsMediaStorage::PUBLIC_ROOT.'/')) {
            $featured = $this->media->publicUrl($featuredRaw) ?? $featuredRaw;
        }

        return [
            'id' => (int) ($row['id'] ?? 0),
            'title' => trim((string) ($row['title'] ?? '')),
            'slug' => trim((string) ($row['slug'] ?? '')),
            'status' => in_array($row['status'] ?? '', ['published', 'draft'], true) ? $row['status'] : 'draft',
            'category' => trim((string) ($row['category'] ?? '')),
            'template' => trim((string) ($row['template'] ?? 'default')) ?: 'default',
            'excerpt' => trim((string) ($row['excerpt'] ?? '')),
            'body' => (string) ($row['body'] ?? ''),
            'featuredImage' => $featured,
            'featuredImagePath' => $featuredRaw,
            'tags' => array_values(array_filter((array) ($row['tags'] ?? []), 'is_string')),
            'seoTitle' => trim((string) ($row['seoTitle'] ?? '')),
            'seoDescription' => trim((string) ($row['seoDescription'] ?? '')),
            'visibility' => ($row['visibility'] ?? 'public') === 'private' ? 'private' : 'public',
            'publishAt' => trim((string) ($row['publishAt'] ?? '')),
            'updatedAt' => trim((string) ($row['updatedAt'] ?? now()->toDateString())),
            'attachments' => $attachments,
        ];
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function deleteRowMedia(array $row): void
    {
        $featured = (string) ($row['featuredImage'] ?? '');
        if ($featured !== '' && str_contains($featured, CmsMediaStorage::PUBLIC_ROOT)) {
            $this->media->delete($featured);
        }
        foreach ((array) ($row['attachments'] ?? []) as $att) {
            if (is_array($att) && isset($att['path'])) {
                $this->media->delete((string) $att['path']);
            }
        }
    }
}
