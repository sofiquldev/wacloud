<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Concerns\EnsuresCoreSchema;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use EnsuresCoreSchema;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->ensureCoreCmsTablesExist();

        $this->call([
            AdminUserSeeder::class,
            PabnaOfficialPourashavaSeeder::class,
        ]);

        User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );
    }
}
