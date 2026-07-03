<?php

namespace App\Domains\WhatsApp\Contracts;

use App\Models\Message;
use App\Models\WhatsAppAccount;

interface WhatsAppProvider
{
    public function startSession(WhatsAppAccount $account): void;

    /**
     * @return array{status: string, qr?: string|null, phone?: string|null}
     */
    public function sessionStatus(WhatsAppAccount $account): array;

    public function sendText(WhatsAppAccount $account, string $toJid, string $body): array;

    public function disconnect(WhatsAppAccount $account): void;
}
