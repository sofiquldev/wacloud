<?php

namespace Tests\Feature\Admin;

use App\Cms\CmsSettingKey;
use App\Models\CmsSetting;
use App\Models\User;
use App\Support\CmsContentRepository;
use App\Support\CmsMediaStorage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class CmsContentUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_notice_with_featured_image_and_attachment(): void
    {
        $user = User::factory()->create();

        $featured = UploadedFile::fake()->create('cover.jpg', 8, 'image/jpeg');
        $attachment = UploadedFile::fake()->create('notice.pdf', 32, 'application/pdf');

        $response = $this->withoutMiddleware()
            ->actingAs($user)
            ->post(route('admin.content.store', ['kind' => 'notice']), [
                'title' => 'Water supply update',
                'slug' => 'water-supply-update',
                'status' => 'published',
                'category' => 'Administration',
                'template' => 'default',
                'excerpt' => 'Schedule change',
                'body' => '<p>Details</p>',
                'tags' => json_encode(['water']),
                'featuredImage' => $featured,
                'newAttachments' => [$attachment],
                'existingAttachments' => json_encode([]),
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('status', 'content-saved');

        $stored = CmsSetting::query()
            ->where('key', CmsSettingKey::CMS_NOTICES)
            ->value('payload');

        $this->assertIsArray($stored);
        $this->assertCount(1, $stored);
        $row = $stored[0];
        $this->assertSame('Water supply update', $row['title']);
        $this->assertStringContainsString(CmsMediaStorage::PUBLIC_ROOT.'/notice/', (string) $row['featuredImage']);
        $this->assertCount(1, $row['attachments']);
        $this->assertStringContainsString(CmsMediaStorage::PUBLIC_ROOT.'/notice/', (string) $row['attachments'][0]['path']);
        $this->assertFileExists(public_path((string) $row['featuredImage']));
        $this->assertFileExists(public_path((string) $row['attachments'][0]['path']));

        File::delete(public_path((string) $row['featuredImage']));
        File::delete(public_path((string) $row['attachments'][0]['path']));
    }

    public function test_admin_can_update_notice_with_new_featured_image(): void
    {
        $user = User::factory()->create();
        $repo = app(CmsContentRepository::class);
        $row = $repo->upsert('notice', [
            'title' => 'Draft notice',
            'slug' => 'draft-notice',
            'status' => 'draft',
            'category' => 'Administration',
            'template' => 'default',
            'excerpt' => '',
            'body' => '',
            'tags' => [],
            'attachments' => [],
            'featuredImage' => '',
        ]);
        $id = (int) $row['id'];

        $featured = UploadedFile::fake()->create('hero.png', 8, 'image/png');

        $response = $this->withoutMiddleware()
            ->actingAs($user)
            ->post(route('admin.content.update', ['kind' => 'notice', 'id' => $id]), [
                'title' => 'Draft notice',
                'slug' => 'draft-notice',
                'status' => 'published',
                'category' => 'Administration',
                'template' => 'default',
                'excerpt' => 'Updated',
                'body' => '<p>Body</p>',
                'tags' => json_encode([]),
                'featuredImage' => $featured,
                'existingAttachments' => json_encode([]),
            ]);

        $response->assertRedirect(route('admin.content.edit', ['kind' => 'notice', 'id' => $id]));
        $response->assertSessionHas('status', 'content-saved');

        $found = $repo->find('notice', $id);
        $this->assertNotNull($found);
        $this->assertSame('published', $found['status']);
        $this->assertStringContainsString(CmsMediaStorage::PUBLIC_ROOT.'/notice/', (string) $found['featuredImagePath']);

        File::delete(public_path((string) $found['featuredImagePath']));
    }

    public function test_admin_can_update_notice_that_is_not_in_database_yet(): void
    {
        $user = User::factory()->create();

        $response = $this->withoutMiddleware()
            ->actingAs($user)
            ->post(route('admin.content.update', ['kind' => 'notice', 'id' => 3]), [
                'title' => 'Vaccination drive schedule',
                'slug' => 'vaccination-drive',
                'status' => 'published',
                'category' => 'Health',
                'template' => 'default',
                'excerpt' => 'Updated excerpt',
                'body' => '<p>Schedule details</p>',
                'tags' => json_encode([]),
                'existingAttachments' => json_encode([]),
            ]);

        $response->assertRedirect(route('admin.content.edit', ['kind' => 'notice', 'id' => 3]));
        $response->assertSessionHas('status', 'content-saved');

        $found = app(CmsContentRepository::class)->find('notice', 3);
        $this->assertNotNull($found);
        $this->assertSame('Updated excerpt', $found['excerpt']);
    }
}
