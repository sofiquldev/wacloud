<?php

namespace App\Services\Analytics;

use App\Enums\MessageDirection;
use App\Enums\MessageStatus;
use App\Enums\WhatsAppAccountStatus;
use App\Models\Message;
use App\Models\Organization;
use App\Models\WhatsAppAccount;

class OrganizationAnalytics
{
    /**
     * @return array<string, int|float>
     */
    public function overview(Organization $organization): array
    {
        $accountIds = WhatsAppAccount::where('organization_id', $organization->id)->pluck('id');

        $connected = WhatsAppAccount::where('organization_id', $organization->id)
            ->where('status', WhatsAppAccountStatus::Connected)
            ->count();

        $inbound = Message::where('organization_id', $organization->id)
            ->where('direction', MessageDirection::Inbound)
            ->count();

        $outbound = Message::where('organization_id', $organization->id)
            ->where('direction', MessageDirection::Outbound)
            ->count();

        $failed = Message::where('organization_id', $organization->id)
            ->where('status', MessageStatus::Failed)
            ->count();

        $total = max(1, $inbound + $outbound);
        $successRate = round((($inbound + $outbound - $failed) / $total) * 100, 1);

        return [
            'accounts_total' => $accountIds->count(),
            'accounts_connected' => $connected,
            'messages_inbound' => $inbound,
            'messages_outbound' => $outbound,
            'messages_failed' => $failed,
            'delivery_success_rate' => $successRate,
            'is_sandbox' => $organization->is_sandbox ? 1 : 0,
        ];
    }
}
