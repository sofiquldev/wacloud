<?php

use App\Http\Controllers\Internal\BridgeWebhookController;
use App\Http\Middleware\AuthenticateBridge;
use Illuminate\Support\Facades\Route;

Route::middleware(AuthenticateBridge::class)->prefix('internal/bridge')->group(function () {
    Route::post('session-update', [BridgeWebhookController::class, 'sessionUpdate']);
    Route::post('inbound-message', [BridgeWebhookController::class, 'inboundMessage']);
});
