<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\WebhookEndpoint;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WebhookPageController extends Controller
{
    public function index(Request $request): Response
    {
        $org = $request->user()->currentOrganization();

        return Inertia::render('Console/Webhooks', [
            'webhooks' => WebhookEndpoint::where('organization_id', $org->id)->orderByDesc('created_at')->get(),
            'availableEvents' => [
                'message.received',
                'message.sent',
                'message.failed',
                'account.connected',
                'account.disconnected',
                'account.restricted',
            ],
        ]);
    }

    public function store(Request $request, AuditLogger $audit): RedirectResponse
    {
        $org = $request->user()->currentOrganization();

        $validated = $request->validate([
            'url' => ['required', 'url', 'max:500'],
            'events' => ['nullable', 'array'],
            'enabled' => ['boolean'],
        ]);

        WebhookEndpoint::create([
            'organization_id' => $org->id,
            'url' => $validated['url'],
            'events' => $validated['events'] ?? [],
            'enabled' => $validated['enabled'] ?? true,
        ]);

        $audit->log($org, 'webhook.created', $request->user());

        return redirect()->route('console.webhooks.index');
    }

    public function update(Request $request, WebhookEndpoint $webhook, AuditLogger $audit): RedirectResponse
    {
        $org = $request->user()->currentOrganization();
        abort_if($webhook->organization_id !== $org->id, 404);

        $validated = $request->validate([
            'url' => ['sometimes', 'url', 'max:500'],
            'events' => ['nullable', 'array'],
            'enabled' => ['boolean'],
        ]);

        $webhook->update($validated);
        $audit->log($org, 'webhook.updated', $request->user());

        return redirect()->route('console.webhooks.index');
    }

    public function destroy(Request $request, WebhookEndpoint $webhook, AuditLogger $audit): RedirectResponse
    {
        $org = $request->user()->currentOrganization();
        abort_if($webhook->organization_id !== $org->id, 404);

        $webhook->delete();
        $audit->log($org, 'webhook.deleted', $request->user());

        return redirect()->route('console.webhooks.index');
    }
}
