<?php

namespace App\Models;

use App\Enums\WhatsAppAccountStatus;
use App\Enums\WhatsAppProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class WhatsAppAccount extends Model
{
    protected $table = 'whatsapp_accounts';

    protected $fillable = [
        'organization_id',
        'provider',
        'label',
        'phone_e164',
        'display_name',
        'status',
        'bridge_session_id',
        'session_data',
        'metadata',
        'connected_at',
    ];

    protected function casts(): array
    {
        return [
            'provider' => WhatsAppProvider::class,
            'status' => WhatsAppAccountStatus::class,
            'metadata' => 'array',
            'connected_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (WhatsAppAccount $account) {
            if (empty($account->bridge_session_id)) {
                $account->bridge_session_id = (string) Str::uuid();
            }
        });
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function isConnected(): bool
    {
        return $this->status === WhatsAppAccountStatus::Connected;
    }
}
