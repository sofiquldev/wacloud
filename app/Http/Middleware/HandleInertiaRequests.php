<?php

namespace App\Http\Middleware;

use App\Models\Member;
use App\Support\CmsCatalogResolver;
use App\Support\CmsContentCatalog;
use App\Support\MemberWidgetMessageEnricher;
use App\Support\NavMenuRepository;
use App\Support\SiteSettingsRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $p = $request->path();
        $activePath = $p === '' ? '/' : '/'.$p;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'activePath' => $activePath,
            'status' => fn () => $request->session()->get('status'),
            'publicNav' => static function () {
                try {
                    return app(NavMenuRepository::class)->publicNav();
                } catch (\Throwable $e) {
                    report($e);

                    return ['items' => []];
                }
            },
            'site' => static function () {
                try {
                    return app(SiteSettingsRepository::class)->forPublic();
                } catch (\Throwable $e) {
                    report($e);

                    return [];
                }
            },
            'cmsCatalog' => static function () {
                try {
                    return app(CmsCatalogResolver::class)->merged();
                } catch (\Throwable $e) {
                    report($e);

                    return config('cms_catalog');
                }
            },
            'pageLayoutTemplates' => static fn () => config('cms_page_layouts.templates', []),
            'cmsServices' => static function () {
                try {
                    return app(CmsContentCatalog::class)->services();
                } catch (\Throwable $e) {
                    report($e);

                    return [];
                }
            },
            'membersDirectory' => function () use ($request) {
                if (! $request->user()) {
                    return [];
                }
                try {
                    if (! Schema::hasTable('members')) {
                        return [];
                    }
                    $enricher = app(MemberWidgetMessageEnricher::class);

                    return Member::query()
                        ->orderBy('name')
                        ->get()
                        ->map(static fn (Member $m) => $enricher->memberToDirectoryRow($m))
                        ->values()
                        ->all();
                } catch (\Throwable $e) {
                    report($e);

                    return [];
                }
            },
            'cmsPagesCatalog' => function () use ($request) {
                if (! $request->user()) {
                    return [];
                }
                try {
                    return app(CmsContentCatalog::class)->adminPagesForManager();
                } catch (\Throwable $e) {
                    report($e);

                    return [];
                }
            },
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'seo' => [
                'title' => config('app.name'),
                'description' => null,
                'keywords' => null,
                'canonical' => $request->url(),
            ],
        ];
    }
}
