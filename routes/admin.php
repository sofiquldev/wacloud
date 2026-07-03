<?php

use App\Http\Controllers\Admin\CmsContentController;
use App\Http\Controllers\Admin\HomepageWidgetLayoutController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\NavMenuController;
use App\Support\CmsContentRepository;
use App\Support\HomepageWidgetLayoutRepository;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| CMS backend (authenticated)
|--------------------------------------------------------------------------
|
| Prefix: /admin    Name prefix: admin.*
| Dashboard at GET /admin remains route('dashboard') in web.php.
|
*/

Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('members', [MemberController::class, 'index'])->name('members.index');
        Route::post('members', [MemberController::class, 'store'])->name('members.store');
        Route::put('members/{member}', [MemberController::class, 'update'])->name('members.update');
        Route::delete('members/{member}', [MemberController::class, 'destroy'])->name('members.destroy');
        Route::get('elections', fn () => Inertia::render('Admin/Elections'))->name('elections.index');
        Route::get('pages', fn () => Inertia::render('Admin/Pages'))->name('pages.index');
        Route::get('services', function () {
            return Inertia::render('Admin/Services', [
                'items' => app(CmsContentRepository::class)->services(),
            ]);
        })->name('services.index');
        Route::get('notices', function () {
            return Inertia::render('Admin/Notices', [
                'items' => app(CmsContentRepository::class)->notices(),
            ]);
        })->name('notices.index');
        Route::get('complaints', fn () => Inertia::render('Admin/Complaints'))->name('complaints.index');
        Route::get('templates', [HomepageWidgetLayoutController::class, 'index'])->name('templates.index');
        Route::put('templates', [HomepageWidgetLayoutController::class, 'update'])->name('templates.update');
        Route::redirect('widgets', '/admin/templates')->name('widgets.index');

        Route::get('menus', [NavMenuController::class, 'index'])->name('menus.index');
        Route::post('menus', [NavMenuController::class, 'update'])->name('menus.update');

        Route::post('content/{kind}', [CmsContentController::class, 'store'])
            ->where('kind', 'notice|service')
            ->name('content.store');
        Route::post('content/{kind}/{id}', [CmsContentController::class, 'update'])
            ->where('kind', 'notice|service')
            ->where('id', '[0-9]+')
            ->name('content.update');
        Route::delete('content/{kind}/{id}', [CmsContentController::class, 'destroy'])
            ->where('kind', 'notice|service')
            ->where('id', '[0-9]+')
            ->name('content.destroy');

        Route::get('content/{kind}/{id}', function (string $kind, string $id) {
            $payload = null;
            try {
                $payload = app(HomepageWidgetLayoutRepository::class)->load();
            } catch (\Throwable $e) {
                report($e);
            }
            $templates = [];
            if (is_array($payload) && isset($payload['templates']) && is_array($payload['templates'])) {
                foreach ($payload['templates'] as $t) {
                    if (! is_array($t)) {
                        continue;
                    }
                    $templates[] = [
                        'id' => (string) ($t['id'] ?? ''),
                        'name' => (string) ($t['name'] ?? 'Template'),
                        'kind' => (string) ($t['kind'] ?? 'custom'),
                        'columnLayout' => (string) ($t['columnLayout'] ?? 'content-right'),
                    ];
                }
            }

            $cmsContentItem = null;
            if (in_array($kind, ['notice', 'service'], true) && $id !== 'new' && ctype_digit($id)) {
                $cmsContentItem = app(CmsContentRepository::class)->find($kind, (int) $id);
            }

            return Inertia::render('Admin/ContentEdit', [
                'kind' => $kind,
                'id' => $id,
                'availableTemplates' => $templates,
                'cmsContentItem' => $cmsContentItem,
            ]);
        })
            ->where('kind', 'page|service|notice')
            ->where('id', 'new|[0-9]+')
            ->name('content.edit');
    });
