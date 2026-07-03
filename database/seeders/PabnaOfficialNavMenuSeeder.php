<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * @deprecated Use {@see PabnaCmsMenusAndPagesSeeder} directly. Kept as a stable name for existing calls.
 */
class PabnaOfficialNavMenuSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PabnaCmsMenusAndPagesSeeder::class);
    }
}
