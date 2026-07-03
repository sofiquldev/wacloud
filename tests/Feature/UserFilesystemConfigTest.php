<?php

namespace Tests\Feature;

use App\Enums\FilesystemProvider;
use App\Models\User;
use App\Models\UserFilesystemConfig;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserFilesystemConfigTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_store_encrypted_filesystem_credentials(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->from(route('profile.edit'))
            ->post(route('profile.filesystems.store'), [
            'name' => 'My Wasabi',
            'provider' => FilesystemProvider::Wasabi->value,
            'credentials' => [
                'access_key_id' => 'AKIATESTKEY',
                'secret_access_key' => 'secret-value',
            ],
            'options' => [
                'bucket' => 'my-bucket',
                'endpoint' => 'https://s3.wasabisys.com',
            ],
            'is_default' => true,
        ]);

        $response->assertRedirect(route('profile.edit'));

        $config = UserFilesystemConfig::query()->where('user_id', $user->id)->first();

        $this->assertNotNull($config);
        $this->assertSame('My Wasabi', $config->name);
        $this->assertTrue($config->is_default);
        $this->assertSame('AKIATESTKEY', $config->credentials['access_key_id']);
        $this->assertStringContainsString('****', $config->toSafeArray()['credentials_hint']);
    }

    public function test_user_cannot_update_another_users_filesystem(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $config = UserFilesystemConfig::create([
            'user_id' => $owner->id,
            'name' => 'Owner bucket',
            'provider' => FilesystemProvider::S3,
            'credentials' => ['access_key_id' => 'x', 'secret_access_key' => 'y'],
            'options' => ['bucket' => 'b'],
            'is_default' => true,
        ]);

        $this->actingAs($other)
            ->delete(route('profile.filesystems.destroy', $config))
            ->assertForbidden();
    }
}
