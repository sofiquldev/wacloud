<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\User;

class AuditLogger
{
    public function log(Organization $organization, string $action, ?User $user = null, array $payload = []): void
    {
        AuditLog::create([
            'organization_id' => $organization->id,
            'user_id' => $user?->id,
            'action' => $action,
            'payload' => $payload,
        ]);
    }
}
