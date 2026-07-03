<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\OrganizationRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'current_organization_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class, 'organization_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function filesystemConfigs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserFilesystemConfig::class);
    }

    public function currentOrganization(): ?Organization
    {
        if ($this->current_organization_id) {
            $org = $this->organizations()->find($this->current_organization_id);
            if ($org) {
                return $org;
            }
        }

        return $this->organizations()->first();
    }

    public function roleIn(Organization $organization): ?OrganizationRole
    {
        $pivot = $this->organizations()
            ->where('organizations.id', $organization->id)
            ->first()?->pivot;

        return $pivot ? OrganizationRole::from($pivot->role) : null;
    }
}
