<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['message' => 'API key required.'], 401);
        }

        $apiKey = ApiKey::findByPlainKey($token);

        if (! $apiKey) {
            return response()->json(['message' => 'Invalid API key.'], 401);
        }

        $apiKey->update(['last_used_at' => now()]);

        $request->attributes->set('api_key', $apiKey);
        $request->attributes->set('organization', $apiKey->organization);

        return $next($request);
    }
}
