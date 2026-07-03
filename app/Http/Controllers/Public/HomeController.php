<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Support\HomepageWidgetLayoutRepository;
use App\Support\MemberWidgetMessageEnricher;
use App\Support\SiteSettingsRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Public municipal site entry (no authentication).
     */
    public function index(): Response
    {
        $site = app(SiteSettingsRepository::class)->forPublic();
        $title = $site['appTitleEn'] ?? config('app.name');

        $layout = null;
        try {
            if (Schema::hasTable('cms_settings')) {
                $layout = app(HomepageWidgetLayoutRepository::class)->load();
            }
        } catch (\Throwable $e) {
            report($e);
        }

        $enricher = app(MemberWidgetMessageEnricher::class);
        $homepageWidgets = $enricher->resolvePublicHomepageWidgets($layout);
        $homepageColumnLayout = $enricher->resolvePublicHomepageColumnLayout($layout);

        return Inertia::render('Public/Home', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'homepageWidgets' => $homepageWidgets,
            'homepageColumnLayout' => $homepageColumnLayout,
            'seo' => [
                'title' => $title,
                'description' => 'Municipal public site — routes in routes/web.php, page in resources/js/Pages/Public/.',
                'keywords' => null,
                'canonical' => url('/'),
            ],
        ]);
    }
}
