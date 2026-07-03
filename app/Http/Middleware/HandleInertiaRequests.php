<?php

namespace App\Http\Middleware;

use App\Support\HostingEnvironment;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $p = $request->path();
        $activePath = $p === '' ? '/' : '/'.$p;
        $user = $request->user();
        $organization = $user?->currentOrganization();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'currentOrganization' => $organization ? [
                'id' => $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
                'is_sandbox' => $organization->is_sandbox,
            ] : null,
            'activePath' => $activePath,
            'status' => fn () => $request->session()->get('status'),
            'publicNav' => [
                'items' => [
                    [
                        'key' => 'home',
                        'label' => 'Home',
                        'href' => '/',
                        'real' => true,
                        'openNewTab' => false,
                        'children' => [],
                    ],
                    [
                        'key' => 'api',
                        'label' => 'API',
                        'href' => '/#api',
                        'real' => true,
                        'openNewTab' => false,
                        'children' => [],
                    ],
                    [
                        'key' => 'pricing',
                        'label' => 'Pricing',
                        'href' => '/pricing',
                        'real' => true,
                        'openNewTab' => false,
                        'children' => [],
                    ],
                ],
            ],
            'site' => static fn () => [],
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
            'deployment' => [
                'profile' => HostingEnvironment::profile(),
                'bridge_available' => (bool) config('wacloud.bridge_available', false),
            ],
        ];
    }
}
