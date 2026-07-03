<?php

namespace App\Services;

use App\Jobs\DeliverWebhook;
use App\Models\Organization;
use App\Models\WebhookEndpoint;

class WebhookDispatcher
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function dispatch(Organization $organization, string $eventType, array $payload): void
    {
        WebhookEndpoint::query()
            ->where('organization_id', $organization->id)
            ->where('enabled', true)
            ->get()
            ->each(function (WebhookEndpoint $endpoint) use ($eventType, $payload) {
                if ($endpoint->listensFor($eventType)) {
                    DeliverWebhook::dispatch($endpoint->id, $eventType, $payload);
                }
            });
    }
}
