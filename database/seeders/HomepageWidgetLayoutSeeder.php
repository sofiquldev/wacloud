<?php

namespace Database\Seeders;

use App\Models\CmsSetting;
use App\Support\CmsPageLayout;
use App\Support\HomepageWidgetLayoutRepository;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

/**
 * Seeds the admin templates store with two starter templates:
 *  - "Homepage"   → kind=homepage,  columnLayout=three-column, widgets from resources/data/homepage_widgets_default.json
 *  - "Inner page" → kind=inner-page, columnLayout=content-right, empty right rail (resolver provides defaults)
 *
 * Skips if a saved templates payload already exists so admin changes are preserved.
 */
class HomepageWidgetLayoutSeeder extends Seeder
{
    public function run(): void
    {
        if (! Schema::hasTable('cms_settings')) {
            $this->command?->warn('HomepageWidgetLayoutSeeder: cms_settings missing. Skipping.');

            return;
        }

        if (CmsSetting::query()->where('key', HomepageWidgetLayoutRepository::KEY)->exists()) {
            $this->command?->info('HomepageWidgetLayoutSeeder: templates already exist, skipping.');

            return;
        }

        $homepageTemplate = $this->buildHomepageTemplate();
        $innerPageTemplate = $this->buildInnerPageTemplate();

        CmsSetting::query()->updateOrCreate(
            ['key' => HomepageWidgetLayoutRepository::KEY],
            [
                'payload' => [
                    'templates' => [$homepageTemplate, $innerPageTemplate],
                    'activeTemplateId' => $homepageTemplate['id'],
                    'applyToPublicHome' => true,
                ],
            ],
        );

        $this->command?->info('HomepageWidgetLayoutSeeder: seeded Homepage + Inner page templates.');
    }

    /**
     * @return array<string, mixed>
     */
    private function buildHomepageTemplate(): array
    {
        $path = resource_path('data/homepage_widgets_default.json');
        $left = [];
        $main = [];
        $right = [];

        if (File::exists($path)) {
            $decoded = json_decode(File::get($path), true);
            if (is_array($decoded)) {
                foreach ($decoded as $row) {
                    if (! is_array($row)) {
                        continue;
                    }
                    $pos = $row['position'] ?? 'main';
                    if ($pos === 'left') {
                        $left[] = $row;
                    } elseif ($pos === 'right') {
                        $right[] = $row;
                    } else {
                        $main[] = $row;
                    }
                }
            }
        }

        return $this->buildTemplate(
            id: 'tpl-homepage',
            name: 'Homepage',
            kind: 'homepage',
            columnLayout: 'three-column',
            leftRows: $left,
            mainRows: $main,
            rightRows: $right,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function buildInnerPageTemplate(): array
    {
        return $this->buildTemplate(
            id: 'tpl-inner-page',
            name: 'Inner page',
            kind: 'inner-page',
            columnLayout: 'content-right',
            leftRows: [],
            mainRows: [],
            rightRows: [],
        );
    }

    /**
     * @param  list<array<string, mixed>>  $leftRows
     * @param  list<array<string, mixed>>  $mainRows
     * @param  list<array<string, mixed>>  $rightRows
     * @return array<string, mixed>
     */
    private function buildTemplate(
        string $id,
        string $name,
        string $kind,
        string $columnLayout,
        array $leftRows,
        array $mainRows,
        array $rightRows,
    ): array {
        $columnLayout = CmsPageLayout::normalize($columnLayout);
        $zones = ['left' => [], 'main' => [], 'right' => []];
        $instances = [];
        $i = 0;

        $push = function (string $zone, array $rows) use (&$zones, &$instances, &$i, $id): void {
            foreach ($rows as $row) {
                $i++;
                $wid = 'wi-'.$id.'-'.$i;
                $zones[$zone][] = $wid;
                $type = isset($row['type']) && is_string($row['type']) ? $row['type'] : '';
                $data = $row['data'] ?? [];
                if (! is_array($data)) {
                    $data = [];
                }
                $instances[$wid] = [
                    'type' => $type,
                    'data' => $data,
                ];
            }
        };

        $push('left', $leftRows);
        $push('main', $mainRows);
        $push('right', $rightRows);

        return [
            'id' => $id,
            'name' => $name,
            'kind' => $kind,
            'columnLayout' => $columnLayout,
            'zones' => $zones,
            'instances' => $instances,
        ];
    }
}
