<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\CmsPreviewController;
use App\Http\Controllers\Public\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public site (outer frontend)
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/p/{slug}', [CmsPreviewController::class, 'page'])
    ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-]*')
    ->name('public.page');

Route::get('/services/{slug}', [CmsPreviewController::class, 'service'])
    ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-]*')
    ->name('public.service');

Route::get('/notices/{slug}', [CmsPreviewController::class, 'notice'])
    ->where('slug', '[A-Za-z0-9][A-Za-z0-9\-]*')
    ->name('public.notice');

/*
|--------------------------------------------------------------------------
| CMS backend (authenticated staff)
|--------------------------------------------------------------------------
| Breeze expects route name "dashboard" — URL is /admin.
*/

Route::get('/admin', function () {
    return Inertia::render('Admin/Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::redirect('/dashboard', '/admin')->middleware(['auth', 'verified']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/site-appearance', [ProfileController::class, 'updateSiteAppearance'])->name('profile.site-appearance.update');
    Route::patch('/profile/site-custom-code', [ProfileController::class, 'updateSiteCustomCode'])->name('profile.site-custom-code.update');
    Route::patch('/profile/catalog-taxonomies', [ProfileController::class, 'updateCatalogTaxonomies'])->name('profile.catalog-taxonomies.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
