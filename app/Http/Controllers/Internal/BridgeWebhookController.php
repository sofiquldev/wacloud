<?php

namespace App\Http\Controllers\Internal;

use App\Enums\WhatsAppAccountStatus;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessInboundMessage;
use App\Models\WhatsAppAccount;
use App\Services\WebhookDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BridgeWebhookController extends Controller
{
    public function sessionUpdate(Request $request, WebhookDispatcher $webhooks): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string'],
            'status' => ['required', 'string'],
            'phone' => ['nullable', 'string'],
            'display_name' => ['nullable', 'string'],
            'qr' => ['nullable', 'string'],
        ]);

        $account = WhatsAppAccount::where('bridge_session_id', $validated['session_id'])->first();

        if (! $account) {
            return response()->json(['message' => 'Account not found.'], 404);
        }

        $status = WhatsAppAccountStatus::tryFrom($validated['status']) ?? WhatsAppAccountStatus::Disconnected;

        $account->update([
            'status' => $status,
            'phone_e164' => $validated['phone'] ?? $account->phone_e164,
            'display_name' => $validated['display_name'] ?? $account->display_name,
            'connected_at' => $status === WhatsAppAccountStatus::Connected ? now() : $account->connected_at,
            'metadata' => array_merge($account->metadata ?? [], [
                'qr' => $validated['qr'] ?? null,
            ]),
        ]);

        $event = match ($status) {
            WhatsAppAccountStatus::Connected => 'account.connected',
            WhatsAppAccountStatus::Restricted => 'account.restricted',
            default => 'account.disconnected',
        };

        $webhooks->dispatch($account->organization, $event, [
            'account_id' => $account->id,
            'status' => $status->value,
            'phone' => $account->phone_e164,
        ]);

        return response()->json(['ok' => true]);
    }

    public function inboundMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string'],
            'from' => ['required', 'string'],
            'body' => ['nullable', 'string'],
            'message_id' => ['nullable', 'string'],
            'push_name' => ['nullable', 'string'],
            'timestamp' => ['nullable', 'integer'],
        ]);

        ProcessInboundMessage::dispatch($validated);

        return response()->json(['ok' => true], 202);
    }
}
