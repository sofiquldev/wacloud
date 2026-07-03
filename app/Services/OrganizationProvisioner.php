<?php

namespace App\Services;

use App\Enums\OrganizationRole;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Str;

class OrganizationProvisioner
{
    public function provisionForUser(User $user, ?string $name = null): Organization
    {
        $orgName = $name ?? "{$user->name}'s Workspace";

        $organization = Organization::create([
            'name' => $orgName,
            'slug' => $this->uniqueSlug($orgName),
            'plan' => 'free',
            'is_sandbox' => false,
        ]);

        $organization->users()->attach($user->id, [
            'role' => OrganizationRole::Owner->value,
        ]);

        $user->update(['current_organization_id' => $organization->id]);

        return $organization;
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'workspace';
        $slug = $base;
        $i = 1;

        while (Organization::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
