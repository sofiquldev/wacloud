<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WebhookEndpoint;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $org = $request->attributes->get('organization');

        return response()->json([
            'data' => WebhookEndpoint::where('organization_id', $org->id)->get(),
        ]);
    }

    public function store(Request $request, AuditLogger $audit): JsonResponse
    {
        $org = $request->attributes->get('organization');

        $validated = $request->validate([
            'url' => ['required', 'url', 'max:500'],
            'events' => ['nullable', 'array'],
            'events.*' => ['string', 'max:64'],
            'enabled' => ['boolean'],
        ]);

        $endpoint = WebhookEndpoint::create([
            'organization_id' => $org->id,
            'url' => $validated['url'],
            'events' => $validated['events'] ?? [],
            'enabled' => $validated['enabled'] ?? true,
        ]);

        $audit->log($org, 'webhook.created', null, ['webhook_id' => $endpoint->id]);

        return response()->json(['data' => $endpoint], 201);
    }

    public function update(Request $request, WebhookEndpoint $webhook, AuditLogger $audit): JsonResponse
    {
        $org = $request->attributes->get('organization');
        abort_if($webhook->organization_id !== $org->id, 404);

        $validated = $request->validate([
            'url' => ['sometimes', 'url', 'max:500'],
            'events' => ['nullable', 'array'],
            'events.*' => ['string', 'max:64'],
            'enabled' => ['boolean'],
        ]);

        $webhook->update($validated);
        $audit->log($org, 'webhook.updated', null, ['webhook_id' => $webhook->id]);

        return response()->json(['data' => $webhook]);
    }

    public function destroy(Request $request, WebhookEndpoint $webhook, AuditLogger $audit): JsonResponse
    {
        $org = $request->attributes->get('organization');
        abort_if($webhook->organization_id !== $org->id, 404);

        $webhook->delete();
        $audit->log($org, 'webhook.deleted', null, ['webhook_id' => $webhook->id]);

        return response()->json(['message' => 'Webhook deleted.']);
    }
}
