<?php

use App\Http\Controllers\Console\ApiKeyPageController;
use App\Http\Controllers\Console\DashboardController;
use App\Http\Controllers\Console\InboxController;
use App\Http\Controllers\Console\WebhookPageController;
use App\Http\Controllers\Console\WhatsAppAccountPageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserFilesystemConfigController;
use App\Http\Middleware\EnsureOrganization;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Public/Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

Route::get('/pricing', function () {
    return Inertia::render('Public/Pricing', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('pricing');

Route::middleware(['auth', 'verified', EnsureOrganization::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/accounts', [WhatsAppAccountPageController::class, 'index'])->name('console.accounts.index');
    Route::post('/accounts', [WhatsAppAccountPageController::class, 'store'])->name('console.accounts.store');
    Route::get('/accounts/{account}/qr', [WhatsAppAccountPageController::class, 'qr'])->name('console.accounts.qr');
    Route::delete('/accounts/{account}', [WhatsAppAccountPageController::class, 'destroy'])->name('console.accounts.destroy');

    Route::get('/inbox', [InboxController::class, 'index'])->name('console.inbox.index');
    Route::get('/inbox/{conversation}', [InboxController::class, 'show'])->name('console.inbox.show');
    Route::post('/inbox/{conversation}/reply', [InboxController::class, 'reply'])->name('console.inbox.reply');

    Route::get('/api-keys', [ApiKeyPageController::class, 'index'])->name('console.api-keys.index');
    Route::post('/api-keys', [ApiKeyPageController::class, 'store'])->name('console.api-keys.store');
    Route::delete('/api-keys/{apiKey}', [ApiKeyPageController::class, 'destroy'])->name('console.api-keys.destroy');

    Route::get('/webhooks', [WebhookPageController::class, 'index'])->name('console.webhooks.index');
    Route::post('/webhooks', [WebhookPageController::class, 'store'])->name('console.webhooks.store');
    Route::put('/webhooks/{webhook}', [WebhookPageController::class, 'update'])->name('console.webhooks.update');
    Route::delete('/webhooks/{webhook}', [WebhookPageController::class, 'destroy'])->name('console.webhooks.destroy');

    Route::get('/docs/api', fn () => Inertia::render('Console/ApiDocs'))->name('console.api-docs');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/profile/filesystems', [UserFilesystemConfigController::class, 'store'])->name('profile.filesystems.store');
    Route::patch('/profile/filesystems/{userFilesystemConfig}', [UserFilesystemConfigController::class, 'update'])->name('profile.filesystems.update');
    Route::delete('/profile/filesystems/{userFilesystemConfig}', [UserFilesystemConfigController::class, 'destroy'])->name('profile.filesystems.destroy');
    Route::post('/profile/filesystems/{userFilesystemConfig}/default', [UserFilesystemConfigController::class, 'setDefault'])->name('profile.filesystems.default');
    Route::post('/profile/filesystems/{userFilesystemConfig}/test', [UserFilesystemConfigController::class, 'test'])->name('profile.filesystems.test');
    Route::post('/profile/backup', [UserFilesystemConfigController::class, 'backup'])->name('profile.backup');
});

require __DIR__.'/auth.php';
