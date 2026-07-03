<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Default staff account for local / staging (change in production).
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@mail.com'],
            [
                'name' => 'Site Administrator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );
    }
}
