<?php

namespace App\Jobs;

use App\Domains\WhatsApp\WhatsAppProviderManager;
use App\Enums\MessageDirection;
use App\Enums\MessageStatus;
use App\Enums\MessageType;
use App\Enums\WhatsAppAccountStatus;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\WhatsAppAccount;
use App\Services\WebhookDispatcher;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;

class ProcessInboundMessage implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public array $payload,
    ) {}

    public function handle(WebhookDispatcher $webhooks): void
    {
        $sessionId = $this->payload['session_id'] ?? null;
        $account = WhatsAppAccount::where('bridge_session_id', $sessionId)->first();

        if (! $account) {
            return;
        }

        $remoteJid = $this->payload['from'] ?? '';
        $body = $this->payload['body'] ?? '';
        $providerId = $this->payload['message_id'] ?? null;

        $conversation = Conversation::firstOrCreate(
            [
                'whatsapp_account_id' => $account->id,
                'remote_jid' => $remoteJid,
            ],
            ['contact_name' => $this->payload['push_name'] ?? null],
        );

        if (! empty($this->payload['push_name'])) {
            $conversation->update(['contact_name' => $this->payload['push_name']]);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'organization_id' => $account->organization_id,
            'direction' => MessageDirection::Inbound,
            'type' => MessageType::Text,
            'body' => $body,
            'status' => MessageStatus::Received,
            'provider_message_id' => $providerId,
            'sent_at' => isset($this->payload['timestamp'])
                ? Carbon::createFromTimestamp((int) $this->payload['timestamp'])
                : now(),
            'metadata' => $this->payload,
        ]);

        $conversation->update(['last_message_at' => $message->created_at]);

        $webhooks->dispatch($account->organization, 'message.received', [
            'message_id' => $message->id,
            'conversation_id' => $conversation->id,
            'account_id' => $account->id,
            'from' => $remoteJid,
            'body' => $body,
        ]);
    }
}
