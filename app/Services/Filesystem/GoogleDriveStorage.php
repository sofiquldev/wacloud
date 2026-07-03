<?php

namespace App\Services\Filesystem;

use App\Models\UserFilesystemConfig;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleDriveStorage
{
    public function verify(UserFilesystemConfig $config): void
    {
        $this->accessToken($config);
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function upload(UserFilesystemConfig $config, string $filename, string $contents, array $metadata = []): string
    {
        $token = $this->accessToken($config);
        $options = $config->options ?? [];
        $folderId = $options['folder_id'] ?? null;

        $meta = array_merge([
            'name' => $filename,
            'mimeType' => $metadata['mime_type'] ?? 'application/json',
        ], $folderId ? ['parents' => [$folderId]] : []);

        $boundary = 'wacloud_'.uniqid();
        $body =
            "--{$boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n".
            json_encode($meta)."\r\n".
            "--{$boundary}\r\nContent-Type: ".($metadata['mime_type'] ?? 'application/json')."\r\n\r\n".
            $contents."\r\n".
            "--{$boundary}--";

        $response = Http::withToken($token)
            ->withHeaders(['Content-Type' => "multipart/related; boundary={$boundary}"])
            ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', $body);

        if (! $response->successful()) {
            throw new RuntimeException('Google Drive upload failed: '.$response->body());
        }

        return (string) $response->json('id');
    }

    private function accessToken(UserFilesystemConfig $config): string
    {
        $credentials = $config->credentials ?? [];

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => $credentials['client_id'] ?? '',
            'client_secret' => $credentials['client_secret'] ?? '',
            'refresh_token' => $credentials['refresh_token'] ?? '',
            'grant_type' => 'refresh_token',
        ]);

        if (! $response->successful()) {
            throw new RuntimeException('Google Drive authentication failed. Check client credentials and refresh token.');
        }

        $token = $response->json('access_token');

        if (! is_string($token) || $token === '') {
            throw new RuntimeException('Google Drive did not return an access token.');
        }

        return $token;
    }
}
