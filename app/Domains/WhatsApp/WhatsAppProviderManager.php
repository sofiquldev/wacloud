<?php

namespace App\Domains\WhatsApp;

use App\Domains\WhatsApp\Contracts\WhatsAppProvider;
use App\Domains\WhatsApp\Providers\CloudApiProvider;
use App\Domains\WhatsApp\Providers\SandboxProvider;
use App\Domains\WhatsApp\Providers\WebBridgeProvider;
use App\Enums\WhatsAppProvider as WhatsAppProviderEnum;
use App\Models\WhatsAppAccount;
use Illuminate\Support\Facades\Http;

class WhatsAppProviderManager
{
    public function for(WhatsAppAccount $account): WhatsAppProvider
    {
        if ($account->organization->is_sandbox) {
            return app(SandboxProvider::class);
        }

        return match ($account->provider) {
            WhatsAppProviderEnum::CloudApi => app(CloudApiProvider::class),
            WhatsAppProviderEnum::Web => app(WebBridgeProvider::class),
            default => app(WebBridgeProvider::class),
        };
    }

    public function bridgeClient()
    {
        return Http::baseUrl(rtrim(config('wacloud.bridge_url'), '/'))
            ->withHeaders([
                'X-Bridge-Secret' => config('wacloud.bridge_secret'),
                'Accept' => 'application/json',
            ])
            ->timeout(30);
    }
}
