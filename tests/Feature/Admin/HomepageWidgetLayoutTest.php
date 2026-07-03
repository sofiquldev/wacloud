<?php

namespace Tests\Feature\Admin;

use App\Models\CmsSetting;
use App\Models\User;
use App\Support\HomepageWidgetLayoutRepository;
use Database\Seeders\HomepageWidgetLayoutSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomepageWidgetLayoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_save_templates_with_empty_inner_page_instances(): void
    {
        $this->seed(HomepageWidgetLayoutSeeder::class);

        $user = User::factory()->create();
        $payload = app(HomepageWidgetLayoutRepository::class)->load();
        $this->assertIsArray($payload);
        $this->assertSame([], $payload['templates'][1]['instances']);

        $payload['templates'][0]['name'] = 'Homepage Updated';
        $firstInstanceKey = array_key_first($payload['templates'][0]['instances']);
        $payload['templates'][0]['instances'][$firstInstanceKey]['data']['title'] = 'Widget title changed';

        $response = $this->withoutMiddleware()
            ->actingAs($user)
            ->put(route('admin.templates.update'), [
            'templates' => $payload['templates'],
            'activeTemplateId' => $payload['activeTemplateId'],
            'applyToPublicHome' => true,
        ]);

        $response->assertRedirect(route('admin.templates.index'));
        $response->assertSessionHas('status', 'templates-saved');

        $stored = CmsSetting::query()
            ->where('key', HomepageWidgetLayoutRepository::KEY)
            ->value('payload');

        $this->assertSame('Homepage Updated', $stored['templates'][0]['name']);
        $this->assertSame(
            'Widget title changed',
            $stored['templates'][0]['instances'][$firstInstanceKey]['data']['title'],
        );
    }
}
