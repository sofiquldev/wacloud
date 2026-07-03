<?php

namespace App\Jobs;

use App\Domains\WhatsApp\WhatsAppProviderManager;
use App\Enums\MessageStatus;
use App\Models\Message;
use App\Services\RateLimiter\WhatsAppSendRateLimiter;
use App\Services\WebhookDispatcher;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendOutboundMessage implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $messageId,
    ) {}

    public function handle(
        WhatsAppProviderManager $providers,
        WhatsAppSendRateLimiter $rateLimiter,
        WebhookDispatcher $webhooks,
    ): void {
        $message = Message::with(['conversation.whatsappAccount.organization'])->find($this->messageId);

        if (! $message || $message->status !== MessageStatus::Queued) {
            return;
        }

        $account = $message->conversation->whatsappAccount;
        $rateLimiter->throttle($account->id);

        try {
            $result = $providers->for($account)->sendText(
                $account,
                $message->conversation->remote_jid,
                (string) $message->body,
            );

            $message->update([
                'status' => MessageStatus::Sent,
                'provider_message_id' => $result['provider_message_id'] ?? $result['id'] ?? null,
                'sent_at' => now(),
            ]);

            $webhooks->dispatch($account->organization, 'message.sent', [
                'message_id' => $message->id,
                'account_id' => $account->id,
                'to' => $message->conversation->remote_jid,
                'body' => $message->body,
            ]);
        } catch (\Throwable $e) {
            $message->update([
                'status' => MessageStatus::Failed,
                'metadata' => array_merge($message->metadata ?? [], ['error' => $e->getMessage()]),
            ]);

            $webhooks->dispatch($account->organization, 'message.failed', [
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
