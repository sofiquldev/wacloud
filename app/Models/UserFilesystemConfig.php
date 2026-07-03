<?php

namespace App\Models;

use App\Enums\FilesystemProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserFilesystemConfig extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'provider',
        'credentials',
        'options',
        'is_default',
        'is_active',
        'last_backup_at',
        'last_verified_at',
    ];

    protected function casts(): array
    {
        return [
            'provider' => FilesystemProvider::class,
            'credentials' => 'encrypted:array',
            'options' => 'array',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'last_backup_at' => 'datetime',
            'last_verified_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saved(function (UserFilesystemConfig $config) {
            if ($config->is_default) {
                self::query()
                    ->where('user_id', $config->user_id)
                    ->where('id', '!=', $config->id)
                    ->update(['is_default' => false]);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function credentialsHint(): string
    {
        $credentials = $this->credentials ?? [];

        $key = match ($this->provider) {
            FilesystemProvider::GoogleDrive => $credentials['refresh_token'] ?? $credentials['client_id'] ?? null,
            FilesystemProvider::Ftp => $credentials['username'] ?? null,
            default => $credentials['access_key_id'] ?? $credentials['key'] ?? null,
        };

        if (! is_string($key) || $key === '') {
            return 'configured';
        }

        if (strlen($key) <= 4) {
            return '****';
        }

        return '****'.substr($key, -4);
    }

    /**
     * @return array<string, mixed>
     */
    public function toSafeArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'provider' => $this->provider->value,
            'provider_label' => $this->provider->label(),
            'options' => $this->maskedOptions(),
            'is_default' => $this->is_default,
            'is_active' => $this->is_active,
            'last_backup_at' => $this->last_backup_at?->toIso8601String(),
            'last_verified_at' => $this->last_verified_at?->toIso8601String(),
            'credentials_hint' => $this->credentialsHint(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function maskedOptions(): array
    {
        $options = $this->options ?? [];

        return array_map(function ($value) {
            if (! is_string($value)) {
                return $value;
            }

            if (strlen($value) <= 4) {
                return $value;
            }

            return $value;
        }, $options);
    }
}
