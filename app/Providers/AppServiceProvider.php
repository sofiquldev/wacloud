<?php

namespace App\Providers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Stale config:cache or empty VIEW_COMPILED_PATH= would leave view.compiled falsy and break Blade bootstrap.
        $compiled = config('view.compiled');
        if (! is_string($compiled) || $compiled === '') {
            config(['view.compiled' => storage_path('framework/views')]);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // FTP deploy excludes runtime dirs (sessions, views, cache, logs); recreate on shared hosting.
        foreach ([
            storage_path('app/public'),
            storage_path('framework/cache'),
            storage_path('framework/cache/data'),
            storage_path('framework/sessions'),
            storage_path('framework/testing'),
            storage_path('framework/views'),
            storage_path('logs'),
            base_path('bootstrap/cache'),
        ] as $dir) {
            File::ensureDirectoryExists($dir, 0775, true);
        }
    }
}
