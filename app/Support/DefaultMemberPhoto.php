<?php

namespace App\Support;

/**
 * Default portrait when a member has no uploaded photo (public/images/default-avatar.webp).
 */
final class DefaultMemberPhoto
{
    public const PATH = '/images/default-avatar.webp';

    public static function url(): string
    {
        return self::PATH;
    }
}
