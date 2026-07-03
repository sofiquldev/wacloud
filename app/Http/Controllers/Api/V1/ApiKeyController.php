<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiKeyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $org = $request->attributes->get('organization');

        $keys = ApiKey::where('organization_id', $org->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (ApiKey $key) => [
                'id' => $key->id,
                'name' => $key->name,
                'prefix' => $key->prefix,
                'last_used_at' => $key->last_used_at,
                'revoked_at' => $key->revoked_at,
                'created_at' => $key->created_at,
            ]);

        return response()->json(['data' => $keys]);
    }

    public function store(Request $request, AuditLogger $audit): JsonResponse
    {
        $org = $request->attributes->get('organization');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
        ]);

        $generated = ApiKey::generate($org, $validated['name']);

        $audit->log($org, 'api_key.created', null, ['api_key_id' => $generated['model']->id]);

        return response()->json([
            'data' => [
                'id' => $generated['model']->id,
                'name' => $generated['model']->name,
                'prefix' => $generated['model']->prefix,
                'key' => $generated['plain'],
            ],
        ], 201);
    }

    public function destroy(Request $request, ApiKey $apiKey, AuditLogger $audit): JsonResponse
    {
        $org = $request->attributes->get('organization');
        abort_if($apiKey->organization_id !== $org->id, 404);

        $apiKey->update(['revoked_at' => now()]);
        $audit->log($org, 'api_key.revoked', null, ['api_key_id' => $apiKey->id]);

        return response()->json(['message' => 'API key revoked.']);
    }
}
