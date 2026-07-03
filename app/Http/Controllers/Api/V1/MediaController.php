<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MediaObject;
use App\Models\Message;
use App\Services\Media\SignedMediaUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $org = $request->attributes->get('organization');

        $validated = $request->validate([
            'message_id' => ['required', 'integer', 'exists:messages,id'],
            'file' => ['required', 'file', 'max:16384', 'mimes:jpeg,jpg,png,webp,gif,pdf,mp4,mp3,ogg'],
        ]);

        $message = Message::where('organization_id', $org->id)->findOrFail($validated['message_id']);

        $disk = config('filesystems.default') === 'wasabi' ? 'wasabi' : 's3';
        $path = $request->file('file')->store(
            "orgs/{$org->id}/media/".date('Y/m'),
            $disk === 'wasabi' && config('filesystems.disks.wasabi.bucket') ? 'wasabi' : 'local',
        );

        $media = MediaObject::create([
            'message_id' => $message->id,
            'disk' => $disk === 'wasabi' && config('filesystems.disks.wasabi.bucket') ? 'wasabi' : 'local',
            'path' => $path,
            'mime' => $request->file('file')->getMimeType(),
            'size_bytes' => $request->file('file')->getSize(),
            'checksum' => hash_file('sha256', $request->file('file')->getRealPath()),
        ]);

        return response()->json(['data' => $media], 201);
    }

    public function show(Request $request, MediaObject $media, SignedMediaUrl $urls): JsonResponse
    {
        $org = $request->attributes->get('organization');
        abort_if($media->message->organization_id !== $org->id, 404);

        return response()->json([
            'data' => [
                'id' => $media->id,
                'mime' => $media->mime,
                'url' => $urls->temporaryUrl($media),
            ],
        ]);
    }
}
