<?php

namespace Database\Seeders;

use App\Cms\CmsSettingKey;
use App\Models\CmsSetting;
use App\Support\NavMenuRepository;
use App\Support\PabnaOfficialNavToPagesTransformer;
use App\Support\PabnaOfficialSiteData;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

/**
 * Seeds CMS page catalog + placeholder bodies from the official nav tree, then saves the nav
 * so items point at internal /p/{slug} pages instead of external placeholders.
 */
class PabnaCmsMenusAndPagesSeeder extends Seeder
{
    public function run(): void
    {
        if (! Schema::hasTable('cms_settings')) {
            $this->command?->warn('PabnaCmsMenusAndPagesSeeder: cms_settings missing. Skipping.');

            return;
        }

        $raw = PabnaOfficialSiteData::navMenuItems();
        if ($raw === []) {
            $this->command?->warn('PabnaCmsMenusAndPagesSeeder: no official nav JSON. Skipping.');

            return;
        }

        $transformed = PabnaOfficialNavToPagesTransformer::transformNavTree($raw);
        $fromNav = PabnaOfficialNavToPagesTransformer::collectPageCatalogFromNav($transformed);

        $baseRows = collect(config('cms_content.pages', []))
            ->map(fn (array $p) => ['slug' => (string) $p['slug'], 'title' => (string) ($p['title'] ?? $p['slug'])])
            ->keyBy('slug');

        foreach ($fromNav as $row) {
            $baseRows[$row['slug']] = $row;
        }

        $mergedRows = $baseRows->sortKeys()->values()->all();
        $pagePayload = PabnaOfficialNavToPagesTransformer::pagesPayloadRows($mergedRows);
        $bodies = PabnaOfficialNavToPagesTransformer::defaultBodiesForCatalog($mergedRows);

        CmsSetting::query()->updateOrCreate(
            ['key' => CmsSettingKey::CMS_PAGES_CATALOG],
            ['payload' => ['pages' => $pagePayload]],
        );

        CmsSetting::query()->updateOrCreate(
            ['key' => CmsSettingKey::CMS_PAGE_BODIES],
            ['payload' => $bodies],
        );

        try {
            app(NavMenuRepository::class)->saveItems($transformed);
        } catch (ValidationException $e) {
            foreach ($e->errors() as $field => $messages) {
                foreach ($messages as $message) {
                    $this->command?->error("{$field}: {$message}");
                }
            }

            throw $e;
        }
    }
}
