<?php

namespace Tests\Feature\Admin;

use App\Models\Member;
use App\Support\MemberPhotoStorage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class MemberPhotoUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_photo_storage_writes_under_public_uploads(): void
    {
        $member = Member::query()->create([
            'name' => 'Test Member',
            'designation' => 'Mayor',
            'ward' => 'Pourashava (city-wide)',
            'session_id' => 's-2024',
            'status' => 'active',
        ]);

        $file = UploadedFile::fake()->create('portrait.jpg', 8, 'image/jpeg');
        $photos = app(MemberPhotoStorage::class);

        $relative = $photos->storeUpload($member, $file);

        $this->assertStringStartsWith(MemberPhotoStorage::PUBLIC_SUBDIR.'/', $relative);
        $this->assertFileExists(public_path($relative));
        $this->assertSame('/'.$relative, $photos->publicUrl($relative));

        File::delete(public_path($relative));
    }
}
