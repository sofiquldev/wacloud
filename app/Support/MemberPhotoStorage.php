<?php

namespace App\Support;

use App\Models\Member;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Member portraits: prefer public/uploads/members (no storage:link required on shared hosting).
 * Legacy rows may still use storage/app/public via photo_path "members/{id}.ext".
 */
final class MemberPhotoStorage
{
    public const PUBLIC_SUBDIR = 'uploads/members';

    public function publicUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, self::PUBLIC_SUBDIR.'/')) {
            return '/'.ltrim($path, '/');
        }

        return PublicStorageUrl::fromPublicDiskPath($path);
    }

    public function storeUpload(Member $member, UploadedFile $file): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        if (! in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
            $ext = 'jpg';
        }
        if ($ext === 'jpeg') {
            $ext = 'jpg';
        }

        $filename = $member->id.'.'.$ext;
        $relative = self::PUBLIC_SUBDIR.'/'.$filename;
        $absoluteDir = public_path(self::PUBLIC_SUBDIR);

        $this->ensureWritableDirectory($absoluteDir);

        $target = $absoluteDir.DIRECTORY_SEPARATOR.$filename;
        if (File::isFile($target)) {
            File::delete($target);
        }

        $realPath = $file->getRealPath();
        if (is_string($realPath) && $realPath !== '' && is_file($realPath)) {
            if (! @copy($realPath, $target)) {
                $contents = $file->get();
                if ($contents === false || $contents === '') {
                    throw new \RuntimeException(
                        'Could not save member photo. Ensure public/uploads/members is writable by the web server.',
                    );
                }
                File::put($target, $contents);
            }
        } else {
            File::put($target, $file->get() ?: '');
        }

        return $relative;
    }

    public function storeBase64(Member $member, string $photoUrl): ?string
    {
        if (! preg_match('#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $photoUrl, $m)) {
            return null;
        }

        $ext = strtolower($m[1] === 'jpg' ? 'jpeg' : $m[1]);
        if ($ext === 'jpeg') {
            $ext = 'jpg';
        }

        $b64 = preg_replace('#^data:image/[^;]+;base64,#i', '', $photoUrl, 1);
        $raw = base64_decode($b64, true);
        if ($raw === false || $raw === '') {
            return null;
        }

        $relative = self::PUBLIC_SUBDIR.'/'.$member->id.'.'.$ext;
        $absoluteDir = public_path(self::PUBLIC_SUBDIR);

        $this->ensureWritableDirectory($absoluteDir);

        $written = File::put($absoluteDir.'/'.$member->id.'.'.$ext, $raw);
        if ($written === false) {
            return null;
        }

        return $relative;
    }

    public function delete(?string $path): void
    {
        if ($path === null || $path === '') {
            return;
        }

        if (str_starts_with($path, self::PUBLIC_SUBDIR.'/')) {
            $absolute = public_path($path);
            if (File::isFile($absolute)) {
                File::delete($absolute);
            }

            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function ensureWritableDirectory(string $absoluteDir): void
    {
        if (! File::isDirectory($absoluteDir)) {
            File::makeDirectory($absoluteDir, 0775, true);
        }
        if (! is_writable($absoluteDir)) {
            throw new \RuntimeException(
                'Upload directory is not writable: '.$absoluteDir
                .'. On Docker, recreate the app container; on shared hosting, chmod 775 public/uploads/members.',
            );
        }
    }
}
