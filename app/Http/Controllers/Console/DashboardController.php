<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\WhatsAppAccount;
use App\Services\Analytics\OrganizationAnalytics;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, OrganizationAnalytics $analytics): Response
    {
        $org = $request->user()->currentOrganization();

        return Inertia::render('Console/Dashboard', [
            'stats' => $analytics->overview($org),
            'accounts' => WhatsAppAccount::where('organization_id', $org->id)
                ->orderByDesc('updated_at')
                ->limit(5)
                ->get(),
            'recentMessages' => Message::where('organization_id', $org->id)
                ->with('conversation')
                ->latest()
                ->limit(10)
                ->get(),
        ]);
    }
}
