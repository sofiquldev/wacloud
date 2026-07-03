<?php

namespace App\Domains\WhatsApp\Providers;

use App\Domains\WhatsApp\Contracts\WhatsAppProvider;
use App\Enums\WhatsAppAccountStatus;
use App\Models\WhatsAppAccount;
use Illuminate\Support\Str;

class SandboxProvider implements WhatsAppProvider
{
    public function startSession(WhatsAppAccount $account): void
    {
        $account->update([
            'status' => WhatsAppAccountStatus::Connected,
            'phone_e164' => '+10000000000',
            'display_name' => 'Sandbox Account',
            'connected_at' => now(),
        ]);
    }

    public function sessionStatus(WhatsAppAccount $account): array
    {
        return [
            'status' => $account->status->value,
            'qr' => null,
            'phone' => $account->phone_e164 ?? '+10000000000',
            'sandbox' => true,
        ];
    }

    public function sendText(WhatsAppAccount $account, string $toJid, string $body): array
    {
        return [
            'provider_message_id' => 'sandbox_'.Str::uuid(),
            'status' => 'sent',
        ];
    }

    public function disconnect(WhatsAppAccount $account): void
    {
        $account->update(['status' => WhatsAppAccountStatus::Disconnected]);
    }
}
