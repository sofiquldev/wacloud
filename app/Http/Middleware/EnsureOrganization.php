<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganization
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->currentOrganization()) {
            return redirect()->route('dashboard')
                ->with('status', 'No organization found. Please contact support.');
        }

        return $next($request);
    }
}
