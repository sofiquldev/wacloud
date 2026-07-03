<?php

namespace App\Jobs;

use App\Models\WebhookDelivery;
use App\Models\WebhookEndpoint;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;

class DeliverWebhook implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public int $endpointId,
        public string $eventType,
        public array $payload,
    ) {}

    public function handle(): void
    {
        $endpoint = WebhookEndpoint::find($this->endpointId);

        if (! $endpoint || ! $endpoint->enabled || ! $endpoint->listensFor($this->eventType)) {
            return;
        }

        $body = json_encode([
            'event' => $this->eventType,
            'data' => $this->payload,
            'timestamp' => now()->toIso8601String(),
        ], JSON_THROW_ON_ERROR);

        $signature = hash_hmac('sha256', $body, $endpoint->secret);

        $delivery = WebhookDelivery::create([
            'webhook_endpoint_id' => $endpoint->id,
            'event_type' => $this->eventType,
            'payload' => $this->payload,
            'attempts' => $this->attempts(),
        ]);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-WaCloud-Signature' => $signature,
            'X-WaCloud-Event' => $this->eventType,
        ])
            ->withBody($body, 'application/json')
            ->timeout(15)
            ->post($endpoint->url);

        $delivery->update([
            'response_code' => $response->status(),
            'response_body' => substr($response->body(), 0, 2000),
            'delivered_at' => $response->successful() ? now() : null,
        ]);

        if (! $response->successful()) {
            $this->release(60 * $this->attempts());
        }
    }
}
