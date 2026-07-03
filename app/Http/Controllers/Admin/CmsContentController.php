<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCmsContentRequest;
use App\Http\Requests\Admin\UpdateCmsContentRequest;
use App\Support\CmsContentRepository;
use App\Support\CmsMediaStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class CmsContentController extends Controller
{
    public function store(
        StoreCmsContentRequest $request,
        string $kind,
        CmsContentRepository $content,
        CmsMediaStorage $media,
    ): RedirectResponse {
        $this->assertKind($kind);

        $id = $content->nextIdFor($kind);
        $payload = array_merge(
            ['id' => $id],
            $request->contentAttributes(),
            $this->mergeUploads($request, $kind, $id, null, $media),
        );
        $row = $content->upsert($kind, $payload);

        return redirect()
            ->route('admin.content.edit', ['kind' => $kind, 'id' => $row['id']])
            ->with('status', 'content-saved');
    }

    public function update(
        UpdateCmsContentRequest $request,
        string $kind,
        int $id,
        CmsContentRepository $content,
        CmsMediaStorage $media,
    ): RedirectResponse {
        $this->assertKind($kind);

        // First save for demo-list rows (shown before anything is in cms_settings) uses the URL id.
        $existing = $content->find($kind, $id);

        $payload = array_merge(
            ['id' => $id],
            $request->contentAttributes(),
            $this->mergeUploads($request, $kind, $id, $existing, $media),
        );
        $row = $content->upsert($kind, $payload);

        return redirect()
            ->route('admin.content.edit', ['kind' => $kind, 'id' => $row['id']])
            ->with('status', 'content-saved');
    }

    public function destroy(
        string $kind,
        int $id,
        CmsContentRepository $content,
    ): RedirectResponse {
        $this->assertKind($kind);
        $content->delete($kind, $id);

        return redirect()
            ->route($this->listRoute($kind))
            ->with('status', 'content-deleted');
    }

    private function assertKind(string $kind): void
    {
        if (! in_array($kind, ['notice', 'service'], true)) {
            abort(404);
        }
    }

    private function listRoute(string $kind): string
    {
        return $kind === 'service' ? 'admin.services.index' : 'admin.notices.index';
    }

    /**
     * @param  array<string, mixed>|null  $existing
     * @return array{attachments: list<array<string, mixed>>, featuredImage: string}
     */
    private function mergeUploads(
        Request $request,
        string $kind,
        int $id,
        ?array $existing,
        CmsMediaStorage $media,
    ): array {
        $existing = $existing ?? ['attachments' => [], 'featuredImagePath' => '', 'featuredImage' => ''];

        $attachments = $this->normalizeExistingAttachments(
            (array) $request->input('existingAttachments', []),
            (array) ($existing['attachments'] ?? []),
        );

        /** @var array<int, UploadedFile> $files */
        $files = $request->file('newAttachments', []);
        if (! is_array($files)) {
            $files = $files ? [$files] : [];
        }
        foreach ($files as $file) {
            if ($file === null) {
                continue;
            }
            $path = $media->storeUpload($kind, $id, $file, $file->getClientOriginalName());
            $attachments[] = [
                'id' => (string) Str::uuid(),
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType() ?: 'application/octet-stream',
                'path' => $path,
            ];
        }

        $featuredStored = (string) ($existing['featuredImagePath'] ?? '');
        if ($featuredStored === '' && isset($existing['featuredImage'])) {
            $featuredStored = $this->pathFromPublicUrl((string) $existing['featuredImage']);
        }

        if ($request->boolean('removeFeaturedImage')) {
            $media->delete($featuredStored);
            $featuredStored = '';
        } elseif ($request->hasFile('featuredImage')) {
            $file = $request->file('featuredImage');
            if ($file !== null) {
                $media->delete($featuredStored);
                $featuredStored = $media->storeUpload($kind, $id, $file, 'featured');
            }
        } else {
            $url = trim((string) $request->input('featuredImageUrl', ''));
            if ($url !== '' && ! str_starts_with($url, 'data:')) {
                if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                    $media->delete($featuredStored);
                    $featuredStored = $url;
                } elseif (str_starts_with($url, '/'.CmsMediaStorage::PUBLIC_ROOT.'/')) {
                    $featuredStored = ltrim($url, '/');
                }
            }
        }

        return [
            'attachments' => $attachments,
            'featuredImage' => $featuredStored,
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $incoming
     * @param  list<array<string, mixed>>  $stored
     * @return list<array<string, mixed>>
     */
    private function normalizeExistingAttachments(array $incoming, array $stored): array
    {
        if ($incoming === []) {
            return [];
        }
        $byId = [];
        foreach ($stored as $row) {
            if (isset($row['id'])) {
                $byId[(string) $row['id']] = $row;
            }
        }
        $out = [];
        foreach ($incoming as $row) {
            if (! is_array($row)) {
                continue;
            }
            $id = (string) ($row['id'] ?? '');
            if ($id !== '' && isset($byId[$id])) {
                $out[] = $byId[$id];

                continue;
            }
            if (isset($row['path']) && is_string($row['path']) && $row['path'] !== '') {
                $out[] = $row;
            }
        }

        return $out;
    }

    private function pathFromPublicUrl(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (is_string($path) && str_contains($path, CmsMediaStorage::PUBLIC_ROOT)) {
            return ltrim($path, '/');
        }

        return '';
    }
}
