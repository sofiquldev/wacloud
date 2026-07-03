<?php

namespace App\Domains\WhatsApp\Providers;

use App\Domains\WhatsApp\Contracts\WhatsAppProvider;
use App\Models\WhatsAppAccount;
use RuntimeException;

class CloudApiProvider implements WhatsAppProvider
{
    public function startSession(WhatsAppAccount $account): void
    {
        throw new RuntimeException('Meta Cloud API provider is not configured yet. Set provider to web or enable sandbox mode.');
    }

    public function sessionStatus(WhatsAppAccount $account): array
    {
        return [
            'status' => 'disconnected',
            'qr' => null,
            'phone' => $account->phone_e164,
            'message' => 'Cloud API integration coming in Phase 3',
        ];
    }

    public function sendText(WhatsAppAccount $account, string $toJid, string $body): array
    {
        throw new RuntimeException('Meta Cloud API send is not implemented yet.');
    }

    public function disconnect(WhatsAppAccount $account): void
    {
        // no-op stub
    }
}
