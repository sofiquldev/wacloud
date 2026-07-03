<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\WhatsAppAccount;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $org = $request->attributes->get('organization');

        $query = Message::query()
            ->where('organization_id', $org->id)
            ->with('conversation')
            ->latest();

        if ($request->filled('account_id')) {
            $accountId = (int) $request->input('account_id');
            $query->whereHas('conversation', fn ($q) => $q->where('whatsapp_account_id', $accountId));
        }

        return response()->json([
            'data' => $query->paginate(50),
        ]);
    }

    public function store(Request $request, MessageService $messages): JsonResponse
    {
        $org = $request->attributes->get('organization');

        $validated = $request->validate([
            'account_id' => ['required', 'integer'],
            'to' => ['required', 'string', 'max:64'],
            'body' => ['required', 'string', 'max:4096'],
        ]);

        $account = WhatsAppAccount::where('organization_id', $org->id)
            ->findOrFail($validated['account_id']);

        abort_unless($account->isConnected(), 422, 'WhatsApp account is not connected.');

        $message = $messages->queueOutbound(
            $org,
            $account,
            $validated['to'],
            $validated['body'],
        );

        return response()->json(['data' => $message->load('conversation')], 202);
    }
}
