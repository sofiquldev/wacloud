<?php

namespace App\Services;

use App\Enums\MessageDirection;
use App\Enums\MessageStatus;
use App\Enums\MessageType;
use App\Jobs\SendOutboundMessage;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Organization;
use App\Models\WhatsAppAccount;

class MessageService
{
    public function queueOutbound(
        Organization $organization,
        WhatsAppAccount $account,
        string $toJid,
        string $body,
        MessageType $type = MessageType::Text,
    ): Message {
        $jid = $this->normalizeJid($toJid);

        $conversation = Conversation::firstOrCreate(
            [
                'whatsapp_account_id' => $account->id,
                'remote_jid' => $jid,
            ],
            ['contact_name' => null],
        );

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'organization_id' => $organization->id,
            'direction' => MessageDirection::Outbound,
            'type' => $type,
            'body' => $body,
            'status' => MessageStatus::Queued,
        ]);

        $conversation->update(['last_message_at' => now()]);

        SendOutboundMessage::dispatch($message->id);

        return $message;
    }

    public function normalizeJid(string $to): string
    {
        $to = trim($to);

        if (str_contains($to, '@')) {
            return $to;
        }

        $digits = preg_replace('/\D+/', '', $to);

        return $digits.'@s.whatsapp.net';
    }
}
