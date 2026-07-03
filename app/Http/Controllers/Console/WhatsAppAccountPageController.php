<?php

namespace App\Http\Controllers\Console;

use App\Domains\WhatsApp\WhatsAppProviderManager;
use App\Http\Controllers\Controller;
use App\Models\WhatsAppAccount;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppAccountPageController extends Controller
{
    public function index(Request $request): Response
    {
        $org = $request->user()->currentOrganization();

        return Inertia::render('Console/Accounts', [
            'accounts' => WhatsAppAccount::where('organization_id', $org->id)
                ->orderByDesc('created_at')
                ->get(),
        ]);
    }

    public function store(Request $request, AuditLogger $audit): RedirectResponse
    {
        $org = $request->user()->currentOrganization();

        $validated = $request->validate([
            'label' => ['nullable', 'string', 'max:120'],
        ]);

        $account = WhatsAppAccount::create([
            'organization_id' => $org->id,
            'label' => $validated['label'] ?? 'WhatsApp Account',
            'provider' => $org->is_sandbox ? 'web' : 'web',
        ]);

        $audit->log($org, 'account.created', $request->user(), ['account_id' => $account->id]);

        return redirect()->route('console.accounts.index');
    }

    public function qr(Request $request, WhatsAppAccount $account, WhatsAppProviderManager $providers)
    {
        $org = $request->user()->currentOrganization();
        abort_if($account->organization_id !== $org->id, 404);

        $provider = $providers->for($account);
        $provider->startSession($account);
        $status = $provider->sessionStatus($account);

        if ($request->wantsJson()) {
            return response()->json(['data' => $status]);
        }

        return Inertia::render('Console/AccountQr', [
            'account' => $account,
            'status' => $status,
        ]);
    }

    public function destroy(Request $request, WhatsAppAccount $account, WhatsAppProviderManager $providers, AuditLogger $audit): RedirectResponse
    {
        $org = $request->user()->currentOrganization();
        abort_if($account->organization_id !== $org->id, 404);

        $providers->for($account)->disconnect($account);
        $account->delete();

        $audit->log($org, 'account.deleted', $request->user(), ['account_id' => $account->id]);

        return redirect()->route('console.accounts.index');
    }
}
