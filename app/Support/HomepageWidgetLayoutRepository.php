<?php

namespace App\Support;

use App\Cms\CmsSettingKey;
use App\Models\CmsSetting;
use Illuminate\Support\Facades\Schema;

class HomepageWidgetLayoutRepository
{
    public const KEY = CmsSettingKey::HOMEPAGE_WIDGET_LAYOUT;

    /**
     * @return array<string, mixed>|null
     */
    public function load(): ?array
    {
        if (! Schema::hasTable('cms_settings')) {
            return null;
        }
        $row = CmsSetting::query()->where('key', self::KEY)->first();
        $payload = $row?->payload;

        return is_array($payload) ? $payload : null;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function save(array $payload): void
    {
        if (! Schema::hasTable('cms_settings')) {
            return;
        }
        CmsSetting::query()->updateOrCreate(
            ['key' => self::KEY],
            ['payload' => $payload],
        );
    }
}
