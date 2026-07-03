<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Support\Concerns\EnsuresCoreSchema;
use Illuminate\Database\Seeder;

/**
 * Optional sample members for local development. Not run from {@see DatabaseSeeder} by default.
 * Run: php artisan db:seed --class=MemberSeeder
 */
class MemberSeeder extends Seeder
{
    use EnsuresCoreSchema;

    public function run(): void
    {
        $this->ensureCoreCmsTablesExist();

        $rows = [
            [
                'name' => 'Md. Sharif Uddin',
                'designation' => 'Mayor',
                'ward' => 'Pourashava (city-wide)',
                'session_id' => 's-2024',
                'phone' => '+8801711-000001',
                'email' => 'mayor@pabna.gov.bd',
                'status' => 'active',
                'public_message' => 'Dear citizens — thank you for your trust. We remain focused on transparent services, safer streets, and digital access for every ward.',
            ],
            [
                'name' => 'Rehana Akter',
                'designation' => 'Reserved Councilor',
                'ward' => 'Ward 4-5-6 (Reserved)',
                'session_id' => 's-2024',
                'status' => 'active',
            ],
            [
                'name' => 'Md. Karim Mia',
                'designation' => 'Councilor',
                'ward' => 'Ward 02',
                'session_id' => 's-2024',
                'status' => 'active',
            ],
            [
                'name' => 'Abdul Hannan',
                'designation' => 'Councilor',
                'ward' => 'Ward 05',
                'session_id' => 's-2014',
                'status' => 'past',
            ],
            [
                'name' => 'Salma Begum',
                'designation' => 'Reserved Councilor',
                'ward' => 'Ward 1-2-3 (Reserved)',
                'session_id' => 's-2024',
                'status' => 'active',
            ],
        ];

        foreach ($rows as $row) {
            Member::query()->updateOrCreate(
                [
                    'name' => $row['name'],
                    'session_id' => $row['session_id'],
                    'designation' => $row['designation'],
                ],
                $row,
            );
        }
    }
}
