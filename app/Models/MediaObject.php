<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaObject extends Model
{
    protected $fillable = [
        'message_id',
        'disk',
        'path',
        'mime',
        'size_bytes',
        'checksum',
        'provider_media_id',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}
