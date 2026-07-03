<?php

namespace App\Support;

use App\Cms\CmsSettingKey;
use App\Models\CmsSetting;
use Illuminate\Support\Facades\Schema;

/**
 * Merges config/cms_catalog.php with optional DB overrides for designations and wards.
 */
final class CmsCatalogResolver
{
    /**
     * @return array<string, mixed>
     */
    public function merged(): array
    {
        $base = config('cms_catalog', []);
        if (! is_array($base)) {
            $base = [];
        }
        $over = $this->loadOverridesPayload();
        if (isset($over['designations']) && is_array($over['designations']) && $over['designations'] !== []) {
            $norm = $this->normalizeStringList($over['designations']);
            if ($norm !== []) {
                $base['designations'] = $norm;
            }
        }
        if (isset($over['wards']) && is_array($over['wards']) && $over['wards'] !== []) {
            $norm = $this->normalizeStringList($over['wards']);
            if ($norm !== []) {
                $base['wards'] = $norm;
            }
        }

        return $base;
    }

    /**
     * @return array{designations: list<string>, wards: list<string>}
     */
    public function loadOverridesPayload(): array
    {
        if (! Schema::hasTable('cms_settings')) {
            return ['designations' => [], 'wards' => []];
        }
        $row = CmsSetting::query()->find(CmsSettingKey::CMS_CATALOG_TAXONOMIES);
        $payload = $row?->payload;
        if (! is_array($payload)) {
            return ['designations' => [], 'wards' => []];
        }

        return [
            'designations' => isset($payload['designations']) && is_array($payload['designations'])
                ? $this->normalizeStringList($payload['designations'])
                : [],
            'wards' => isset($payload['wards']) && is_array($payload['wards'])
                ? $this->normalizeStringList($payload['wards'])
                : [],
        ];
    }

    /**
     * @param  list<string>  $designations
     * @param  list<string>  $wards
     */
    public function saveTaxonomies(array $designations, array $wards): void
    {
        if (! Schema::hasTable('cms_settings')) {
            return;
        }
        CmsSetting::query()->updateOrCreate(
            ['key' => CmsSettingKey::CMS_CATALOG_TAXONOMIES],
            [
                'payload' => [
                    'designations' => $this->normalizeStringList($designations),
                    'wards' => $this->normalizeStringList($wards),
                ],
            ],
        );
    }

    /**
     * @param  array<int, mixed>  $rows
     * @return list<string>
     */
    public function normalizeStringList(array $rows): array
    {
        $out = [];
        $seen = [];
        foreach ($rows as $row) {
            if (! is_string($row)) {
                continue;
            }
            $s = trim($row);
            if ($s === '') {
                continue;
            }
            $k = mb_strtolower($s);
            if (isset($seen[$k])) {
                continue;
            }
            $seen[$k] = true;
            $out[] = $s;
        }

        return $out;
    }
}
