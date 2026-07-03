<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCmsContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('tags') && is_string($this->input('tags'))) {
            $decoded = json_decode($this->input('tags'), true);
            if (is_array($decoded)) {
                $this->merge(['tags' => $decoded]);
            }
        }
        if ($this->has('existingAttachments') && is_string($this->input('existingAttachments'))) {
            $decoded = json_decode($this->input('existingAttachments'), true);
            if (is_array($decoded)) {
                $this->merge(['existingAttachments' => $decoded]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $kind = (string) $this->route('kind');
        $categories = $this->categoriesFor($kind);

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:128', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'status' => ['required', Rule::in(['published', 'draft'])],
            'category' => ['required', 'string', 'max:128', Rule::in($categories)],
            'template' => ['required', 'string', 'max:64'],
            'excerpt' => ['nullable', 'string', 'max:2000'],
            'body' => ['nullable', 'string', 'max:500000'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:64'],
            'seoTitle' => ['nullable', 'string', 'max:128'],
            'seoDescription' => ['nullable', 'string', 'max:512'],
            'visibility' => ['nullable', Rule::in(['public', 'private'])],
            'publishAt' => ['nullable', 'string', 'max:32'],
            'featuredImage' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp', 'max:2560'],
            'featuredImageUrl' => ['nullable', 'string', 'max:2048'],
            'removeFeaturedImage' => ['nullable', 'boolean'],
            'newAttachments' => ['nullable', 'array'],
            'newAttachments.*' => ['file', 'max:5120'],
            'existingAttachments' => ['nullable', 'array'],
        ];
    }

    /**
     * @return list<string>
     */
    private function categoriesFor(string $kind): array
    {
        $catalog = config('cms_catalog', []);

        return match ($kind) {
            'notice' => is_array($catalog['noticeCategories'] ?? null) ? $catalog['noticeCategories'] : [],
            'service' => is_array($catalog['serviceCategories'] ?? null) ? $catalog['serviceCategories'] : [],
            default => [],
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function contentAttributes(): array
    {
        return [
            'title' => trim((string) $this->input('title')),
            'slug' => trim((string) $this->input('slug')),
            'status' => (string) $this->input('status'),
            'category' => trim((string) $this->input('category')),
            'template' => trim((string) $this->input('template')),
            'excerpt' => trim((string) $this->input('excerpt', '')),
            'body' => (string) $this->input('body', ''),
            'tags' => (array) $this->input('tags', []),
            'seoTitle' => trim((string) $this->input('seoTitle', '')),
            'seoDescription' => trim((string) $this->input('seoDescription', '')),
            'visibility' => (string) $this->input('visibility', 'public'),
            'publishAt' => trim((string) $this->input('publishAt', '')),
        ];
    }
}
