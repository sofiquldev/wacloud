<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppAccount;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $org = $request->attributes->get('organization');

        $accounts = WhatsAppAccount::where('organization_id', $org->id)->get();

        return response()->json(['data' => $accounts]);
    }

    public function store(Request $request, AuditLogger $audit): JsonResponse
    {
        $org = $request->attributes->get('organization');

        $validated = $request->validate([
            'label' => ['nullable', 'string', 'max:120'],
            'provider' => ['nullable', 'in:web,cloud_api'],
        ]);

        $account = WhatsAppAccount::create([
            'organization_id' => $org->id,
            'label' => $validated['label'] ?? 'WhatsApp Account',
            'provider' => $validated['provider'] ?? 'web',
        ]);

        $audit->log($org, 'account.created', null, ['account_id' => $account->id]);

        return response()->json(['data' => $account], 201);
    }

    public function show(Request $request, WhatsAppAccount $account): JsonResponse
    {
        $this->authorizeAccount($request, $account);

        return response()->json(['data' => $account]);
    }

    public function qr(Request $request, WhatsAppAccount $account): JsonResponse
    {
        $this->authorizeAccount($request, $account);

        $provider = app(\App\Domains\WhatsApp\WhatsAppProviderManager::class)->for($account);
        $provider->startSession($account);
        $status = $provider->sessionStatus($account);

        return response()->json(['data' => $status]);
    }

    private function authorizeAccount(Request $request, WhatsAppAccount $account): void
    {
        $org = $request->attributes->get('organization');

        abort_if($account->organization_id !== $org->id, 404);
    }
}
