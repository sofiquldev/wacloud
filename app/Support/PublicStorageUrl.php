<?php

namespace App\Support;

/**
 * Build URLs for files on the `public` disk (served via the `public/storage` symlink).
 * Root-relative paths avoid APP_URL host/port mismatches behind proxies or Docker port mapping.
 */
final class PublicStorageUrl
{
    public static function fromPublicDiskPath(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        return '/storage/'.ltrim($path, '/');
    }
}
