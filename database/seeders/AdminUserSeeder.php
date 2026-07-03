<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\OrganizationProvisioner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'admin@mail.com'],
            [
                'name' => 'Site Administrator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        if (! $user->currentOrganization()) {
            app(OrganizationProvisioner::class)->provisionForUser($user, 'WaCloud Demo');
        }
    }
}
