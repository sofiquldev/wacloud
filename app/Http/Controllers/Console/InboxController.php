<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Services\MessageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InboxController extends Controller
{
    public function index(Request $request): Response
    {
        $org = $request->user()->currentOrganization();

        $conversations = Conversation::query()
            ->whereHas('whatsappAccount', fn ($q) => $q->where('organization_id', $org->id))
            ->with(['whatsappAccount:id,label,phone_e164'])
            ->orderByDesc('last_message_at')
            ->paginate(30);

        return Inertia::render('Console/Inbox', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $org = $request->user()->currentOrganization();
        abort_if($conversation->whatsappAccount->organization_id !== $org->id, 404);

        $messages = $conversation->messages()->orderBy('created_at')->get();

        return Inertia::render('Console/InboxThread', [
            'conversation' => $conversation->load('whatsappAccount'),
            'messages' => $messages,
        ]);
    }

    public function reply(Request $request, Conversation $conversation, MessageService $messages): RedirectResponse
    {
        $org = $request->user()->currentOrganization();
        abort_if($conversation->whatsappAccount->organization_id !== $org->id, 404);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:4096'],
        ]);

        $messages->queueOutbound(
            $org,
            $conversation->whatsappAccount,
            $conversation->remote_jid,
            $validated['body'],
        );

        return redirect()->route('console.inbox.show', $conversation);
    }
}
