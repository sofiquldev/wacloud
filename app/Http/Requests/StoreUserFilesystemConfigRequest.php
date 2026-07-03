<?php

namespace App\Http\Requests;

use App\Enums\FilesystemProvider;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserFilesystemConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $provider = FilesystemProvider::tryFrom((string) $this->input('provider'));

        $rules = [
            'name' => ['required', 'string', 'max:120'],
            'provider' => ['required', Rule::enum(FilesystemProvider::class)],
            'is_default' => ['sometimes', 'boolean'],
            'options' => ['sometimes', 'array'],
        ];

        if ($this->isMethod('post')) {
            $rules = array_merge($rules, $this->credentialRules($provider));
        }

        return array_merge($rules, $this->optionRules($provider));
    }

    /**
     * @return array<string, mixed>
     */
    private function credentialRules(?FilesystemProvider $provider): array
    {
        return match ($provider) {
            FilesystemProvider::GoogleDrive => [
                'credentials.client_id' => ['required', 'string', 'max:255'],
                'credentials.client_secret' => ['required', 'string', 'max:255'],
                'credentials.refresh_token' => ['required', 'string', 'max:2048'],
            ],
            FilesystemProvider::Ftp => [
                'credentials.username' => ['required', 'string', 'max:255'],
                'credentials.password' => ['required', 'string', 'max:255'],
            ],
            FilesystemProvider::S3, FilesystemProvider::Wasabi => [
                'credentials.access_key_id' => ['required', 'string', 'max:255'],
                'credentials.secret_access_key' => ['required', 'string', 'max:255'],
            ],
            default => [
                'credentials' => ['required', 'array'],
            ],
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function optionRules(?FilesystemProvider $provider): array
    {
        return match ($provider) {
            FilesystemProvider::GoogleDrive => [
                'options.folder_id' => ['nullable', 'string', 'max:255'],
            ],
            FilesystemProvider::Ftp => [
                'options.host' => ['required', 'string', 'max:255'],
                'options.port' => ['nullable', 'integer', 'min:1', 'max:65535'],
                'options.root_path' => ['nullable', 'string', 'max:500'],
                'options.backup_path' => ['nullable', 'string', 'max:500'],
            ],
            FilesystemProvider::S3, FilesystemProvider::Wasabi => [
                'options.bucket' => ['required', 'string', 'max:255'],
                'options.region' => ['nullable', 'string', 'max:64'],
                'options.endpoint' => ['nullable', 'string', 'max:500'],
                'options.root_prefix' => ['nullable', 'string', 'max:500'],
                'options.backup_path' => ['nullable', 'string', 'max:500'],
                'options.use_path_style_endpoint' => ['sometimes', 'boolean'],
            ],
            default => [],
        };
    }
}
