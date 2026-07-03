<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $org = $request->attributes->get('organization');

        $conversations = Conversation::query()
            ->whereHas('whatsappAccount', fn ($q) => $q->where('organization_id', $org->id))
            ->with(['whatsappAccount:id,label,phone_e164'])
            ->orderByDesc('last_message_at')
            ->paginate(50);

        return response()->json(['data' => $conversations]);
    }
}
