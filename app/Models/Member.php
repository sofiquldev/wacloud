<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    /**
     * Council term identifier (matches {@see config('cms_catalog.sessions')} `id` values), not Laravel session storage.
     */
    protected $fillable = [
        'name',
        'designation',
        'ward',
        'session_id',
        'phone',
        'email',
        'status',
        'public_message',
        'photo_path',
        'party',
    ];
}
