<?php

namespace Database\Seeders;

use App\Support\Concerns\EnsuresCoreSchema;
use App\Support\PabnaOfficialSiteData;
use Illuminate\Database\Seeder;

/**
 * Upserts members from the public pourashava listing (see {@see PabnaOfficialSiteData}).
 */
class PabnaOfficialMembersSeeder extends Seeder
{
    use EnsuresCoreSchema;

    public function run(): void
    {
        $this->ensureCoreCmsTablesExist();

        PabnaOfficialSiteData::seedMembers();
    }
}
