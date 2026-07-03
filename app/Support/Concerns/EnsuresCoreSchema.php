<?php

namespace App\Support\Concerns;

use Illuminate\Support\Facades\Schema;
use RuntimeException;

/**
 * Guards seeders and console jobs that require CMS tables to exist.
 * Prefer {@see \Illuminate\Database\Migrations\Migration} as the single source of schema truth;
 * this trait only improves error messages when {@see migrate} was skipped.
 */
trait EnsuresCoreSchema
{
    protected function ensureCoreCmsTablesExist(): void
    {
        foreach (['members', 'cms_settings'] as $table) {
            if (! Schema::hasTable($table)) {
                throw new RuntimeException(
                    "Missing database table \"{$table}\". Run `php artisan migrate` before seeding or running this command."
                );
            }
        }
    }
}
