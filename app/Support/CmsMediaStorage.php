<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * CMS uploads under public/uploads/cms (no storage:link required).
 */
final class CmsMediaStorage
{
    public const PUBLIC_ROOT = 'uploads/cms';

    public function publicUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/')) {
            return $path;
        }

        return '/'.ltrim($path, '/');
    }

    public function storeUpload(string $kind, int $contentId, UploadedFile $file, ?string $basename = null): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $safeBase = $basename !== null && $basename !== ''
            ? Str::slug(pathinfo($basename, PATHINFO_FILENAME))
            : Str::random(12);
        if ($safeBase === '') {
            $safeBase = Str::random(12);
        }
        $filename = $safeBase.'.'.$ext;
        $relative = self::PUBLIC_ROOT.'/'.$kind.'/'.$contentId.'/'.$filename;
        $absoluteDir = public_path(self::PUBLIC_ROOT.'/'.$kind.'/'.$contentId);

        if (! File::isDirectory($absoluteDir)) {
            File::makeDirectory($absoluteDir, 0755, true);
        }

        $target = $absoluteDir.DIRECTORY_SEPARATOR.$filename;
        if (is_string($file->getRealPath()) && $file->getRealPath() !== '' && is_file($file->getRealPath())) {
            File::copy($file->getRealPath(), $target);
        } else {
            File::put($target, $file->get() ?: '');
        }

        return $relative;
    }

    public function storeBase64Image(string $kind, int $contentId, string $dataUrl, string $basename = 'featured'): ?string
    {
        if (! preg_match('#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $dataUrl, $m)) {
            return null;
        }
        $ext = strtolower($m[1] === 'jpg' ? 'jpeg' : $m[1]);
        if ($ext === 'jpeg') {
            $ext = 'jpg';
        }
        $b64 = preg_replace('#^data:image/[^;]+;base64,#i', '', $dataUrl, 1);
        $raw = base64_decode($b64, true);
        if ($raw === false || $raw === '') {
            return null;
        }

        $relative = self::PUBLIC_ROOT.'/'.$kind.'/'.$contentId.'/'.$basename.'.'.$ext;
        $absoluteDir = public_path(self::PUBLIC_ROOT.'/'.$kind.'/'.$contentId);
        if (! File::isDirectory($absoluteDir)) {
            File::makeDirectory($absoluteDir, 0755, true);
        }
        $written = File::put($absoluteDir.'/'.$basename.'.'.$ext, $raw);
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
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return;
        }
        $relative = ltrim($path, '/');
        if (str_starts_with($relative, self::PUBLIC_ROOT.'/')) {
            $absolute = public_path($relative);
            if (File::isFile($absolute)) {
                File::delete($absolute);
            }
        }
    }

    /**
     * @param  list<array<string, mixed>>  $attachments
     * @return list<array{label: string, url: string, size: string}>
     */
    public function attachmentsForWidget(array $attachments): array
    {
        $out = [];
        foreach ($attachments as $row) {
            if (! is_array($row)) {
                continue;
            }
            $url = $this->publicUrl(isset($row['path']) ? (string) $row['path'] : (isset($row['url']) ? (string) $row['url'] : null));
            if ($url === null || $url === '') {
                continue;
            }
            $label = trim((string) ($row['name'] ?? $row['label'] ?? ''));
            $size = isset($row['size']) ? $this->formatSize($row['size']) : '';
            $out[] = [
                'label' => $label !== '' ? $label : basename($url),
                'url' => $url,
                'size' => $size,
            ];
            if (count($out) >= 30) {
                break;
            }
        }

        return $out;
    }

    public function formatSize(mixed $bytes): string
    {
        if (is_string($bytes) && $bytes !== '' && ! ctype_digit($bytes)) {
            return $bytes;
        }
        $n = (int) $bytes;
        if ($n <= 0) {
            return '';
        }
        if ($n < 1024) {
            return $n.' B';
        }
        if ($n < 1024 * 1024) {
            return round($n / 1024, 1).' KB';
        }

        return round($n / (1024 * 1024), 1).' MB';
    }
}
