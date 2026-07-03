<?php

namespace App\Services\Media;

use App\Models\MediaObject;
use Illuminate\Support\Facades\Storage;

class SignedMediaUrl
{
    public function temporaryUrl(MediaObject $media, int $minutes = 15): ?string
    {
        $disk = Storage::disk($media->disk);

        if (! method_exists($disk, 'temporaryUrl')) {
            return $disk->url($media->path);
        }

        return $disk->temporaryUrl($media->path, now()->addMinutes($minutes));
    }
}
