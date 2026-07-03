<?php

namespace App\Console\Commands;

use App\Support\Concerns\EnsuresCoreSchema;
use App\Support\NavMenuRepository;
use Database\Seeders\HomepageWidgetLayoutSeeder;
use Database\Seeders\PabnaCmsMenusAndPagesSeeder;
use Database\Seeders\PabnaOfficialMembersSeeder;
use Illuminate\Console\Command;
use Illuminate\Database\Seeder;
use Illuminate\Validation\ValidationException;

class SeedPabnaOfficialFromSiteCommand extends Command
{
    use EnsuresCoreSchema;

    protected $signature = 'pabna:seed-official {--members-only : Only sync members from official site data} {--nav-only : Only sync main navigation}';

    protected $description = 'Seed main navigation and members from https://pabnapourashava.gov.bd/ (Bengali labels; custom URLs are placeholders until remapped in Admin → Menus).';

    public function handle(): int
    {
        try {
            $this->ensureCoreCmsTablesExist();
        } catch (\Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $membersOnly = (bool) $this->option('members-only');
        $navOnly = (bool) $this->option('nav-only');

        if (! $membersOnly) {
            try {
                $this->invokeOfficialSeeder(HomepageWidgetLayoutSeeder::class);
            } catch (\Throwable $e) {
                report($e);
                $this->warn('Homepage widget layout seed skipped: '.$e->getMessage());
            }
            try {
                $this->invokeOfficialSeeder(PabnaCmsMenusAndPagesSeeder::class);
            } catch (ValidationException $e) {
                foreach ($e->errors() as $field => $messages) {
                    foreach ($messages as $message) {
                        $this->error("{$field}: {$message}");
                    }
                }

                return self::FAILURE;
            } catch (\Throwable $e) {
                report($e);
                $this->error($e->getMessage());

                return self::FAILURE;
            }
            $this->info('Main navigation saved (database key: '.NavMenuRepository::NAV_DOCUMENT_DB_KEY.').');
        }

        if (! $navOnly) {
            try {
                $this->invokeOfficialSeeder(PabnaOfficialMembersSeeder::class);
            } catch (\Throwable $e) {
                report($e);
                $this->error($e->getMessage());

                return self::FAILURE;
            }
            $this->info('Members synced from official site sample data.');
        }

        return self::SUCCESS;
    }

    /**
     * @param  class-string<Seeder>  $class
     */
    private function invokeOfficialSeeder(string $class): void
    {
        $seeder = $this->laravel->make($class);
        if (! $seeder instanceof Seeder) {
            throw new \InvalidArgumentException("{$class} must extend ".Seeder::class);
        }
        $seeder->setContainer($this->laravel);
        $seeder->setCommand($this);
        $seeder->__invoke();
    }
}
