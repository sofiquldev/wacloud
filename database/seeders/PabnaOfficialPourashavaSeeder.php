<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Runs official homepage layout, CMS nav/pages, and members (same as {@see \App\Console\Commands\SeedPabnaOfficialFromSiteCommand}).
 */
class PabnaOfficialPourashavaSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            HomepageWidgetLayoutSeeder::class,
            PabnaCmsMenusAndPagesSeeder::class,
            PabnaOfficialMembersSeeder::class,
        ]);
    }
}
