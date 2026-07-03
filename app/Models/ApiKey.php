<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    protected $fillable = [
        'organization_id',
        'name',
        'prefix',
        'key_hash',
        'last_used_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function isActive(): bool
    {
        return $this->revoked_at === null;
    }

    /**
     * @return array{plain: string, model: self}
     */
    public static function generate(Organization $organization, string $name): array
    {
        $prefix = 'wc_'.Str::lower(Str::random(8));
        $secret = Str::lower(Str::random(32));
        $plain = $prefix.'_'.$secret;

        $model = self::create([
            'organization_id' => $organization->id,
            'name' => $name,
            'prefix' => $prefix,
            'key_hash' => hash('sha256', $plain),
        ]);

        return ['plain' => $plain, 'model' => $model];
    }

    public static function findByPlainKey(string $plainKey): ?self
    {
        $hash = hash('sha256', $plainKey);

        return self::query()
            ->where('key_hash', $hash)
            ->whereNull('revoked_at')
            ->first();
    }
}
