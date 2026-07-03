<?php

namespace App\Http\Requests;

use App\Enums\FilesystemProvider;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserFilesystemConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        $config = $this->route('userFilesystemConfig');

        return $this->user()?->id === $config?->user_id;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $provider = $this->route('userFilesystemConfig')?->provider;

        $rules = [
            'name' => ['sometimes', 'string', 'max:120'],
            'is_default' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'options' => ['sometimes', 'array'],
        ];

        if ($this->has('credentials')) {
            $rules = array_merge($rules, match ($provider) {
                FilesystemProvider::GoogleDrive => [
                    'credentials.client_id' => ['sometimes', 'string', 'max:255'],
                    'credentials.client_secret' => ['sometimes', 'string', 'max:255'],
                    'credentials.refresh_token' => ['sometimes', 'string', 'max:2048'],
                ],
                FilesystemProvider::Ftp => [
                    'credentials.username' => ['sometimes', 'string', 'max:255'],
                    'credentials.password' => ['sometimes', 'string', 'max:255'],
                ],
                FilesystemProvider::S3, FilesystemProvider::Wasabi => [
                    'credentials.access_key_id' => ['sometimes', 'string', 'max:255'],
                    'credentials.secret_access_key' => ['sometimes', 'string', 'max:255'],
                ],
                default => ['credentials' => ['array']],
            });
        }

        return $rules;
    }
}
