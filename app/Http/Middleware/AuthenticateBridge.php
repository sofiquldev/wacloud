<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateBridge
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = $request->header('X-Bridge-Secret');

        if (! $secret || ! hash_equals((string) config('wacloud.bridge_secret'), (string) $secret)) {
            return response()->json(['message' => 'Unauthorized bridge request.'], 401);
        }

        return $next($request);
    }
}
