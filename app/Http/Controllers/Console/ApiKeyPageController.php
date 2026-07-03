<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiKeyPageController extends Controller
{
    public function index(Request $request): Response
    {
        $org = $request->user()->currentOrganization();

        return Inertia::render('Console/ApiKeys', [
            'apiKeys' => ApiKey::where('organization_id', $org->id)->orderByDesc('created_at')->get(),
            'newKey' => session('new_api_key'),
        ]);
    }

    public function store(Request $request, AuditLogger $audit): RedirectResponse
    {
        $org = $request->user()->currentOrganization();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
        ]);

        $generated = ApiKey::generate($org, $validated['name']);
        $audit->log($org, 'api_key.created', $request->user(), ['api_key_id' => $generated['model']->id]);

        return redirect()->route('console.api-keys.index')
            ->with('new_api_key', $generated['plain']);
    }

    public function destroy(Request $request, ApiKey $apiKey, AuditLogger $audit): RedirectResponse
    {
        $org = $request->user()->currentOrganization();
        abort_if($apiKey->organization_id !== $org->id, 404);

        $apiKey->update(['revoked_at' => now()]);
        $audit->log($org, 'api_key.revoked', $request->user(), ['api_key_id' => $apiKey->id]);

        return redirect()->route('console.api-keys.index');
    }
}
