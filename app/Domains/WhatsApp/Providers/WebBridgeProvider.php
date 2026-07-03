<?php

namespace App\Domains\WhatsApp\Providers;

use App\Domains\WhatsApp\Contracts\WhatsAppProvider;
use App\Domains\WhatsApp\WhatsAppProviderManager;
use App\Models\WhatsAppAccount;
use RuntimeException;

class WebBridgeProvider implements WhatsAppProvider
{
    public function __construct(
        private WhatsAppProviderManager $manager,
    ) {}

    public function startSession(WhatsAppAccount $account): void
    {
        $response = $this->manager->bridgeClient()->post("/sessions/{$account->bridge_session_id}/start", [
            'account_id' => $account->id,
        ]);

        if (! $response->successful()) {
            throw new RuntimeException('Bridge failed to start session: '.$response->body());
        }
    }

    public function sessionStatus(WhatsAppAccount $account): array
    {
        $response = $this->manager->bridgeClient()->get("/sessions/{$account->bridge_session_id}/status");

        if (! $response->successful()) {
            return ['status' => 'disconnected', 'qr' => null, 'phone' => null];
        }

        return $response->json();
    }

    public function sendText(WhatsAppAccount $account, string $toJid, string $body): array
    {
        $response = $this->manager->bridgeClient()->post("/sessions/{$account->bridge_session_id}/send", [
            'to' => $toJid,
            'body' => $body,
        ]);

        if (! $response->successful()) {
            throw new RuntimeException('Bridge send failed: '.$response->body());
        }

        return $response->json();
    }

    public function disconnect(WhatsAppAccount $account): void
    {
        $this->manager->bridgeClient()->delete("/sessions/{$account->bridge_session_id}");
    }
}
