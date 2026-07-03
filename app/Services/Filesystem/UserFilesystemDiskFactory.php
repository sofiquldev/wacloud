<?php

namespace App\Services\Filesystem;

use App\Enums\FilesystemProvider;
use App\Models\UserFilesystemConfig;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;

class UserFilesystemDiskFactory
{
    public function disk(UserFilesystemConfig $config): Filesystem
    {
        if (! $config->is_active) {
            throw new RuntimeException('Filesystem configuration is disabled.');
        }

        $diskName = 'user_fs_'.$config->id;

        config(['filesystems.disks.'.$diskName => $this->buildDiskConfig($config)]);

        return Storage::disk($diskName);
    }

    /**
     * @return array<string, mixed>
     */
    public function buildDiskConfig(UserFilesystemConfig $config): array
    {
        $credentials = $config->credentials ?? [];
        $options = $config->options ?? [];

        return match ($config->provider) {
            FilesystemProvider::S3, FilesystemProvider::Wasabi => [
                'driver' => 's3',
                'key' => $credentials['access_key_id'] ?? $credentials['key'] ?? '',
                'secret' => $credentials['secret_access_key'] ?? $credentials['secret'] ?? '',
                'region' => $options['region'] ?? 'us-east-1',
                'bucket' => $options['bucket'] ?? '',
                'endpoint' => $options['endpoint'] ?? null,
                'use_path_style_endpoint' => (bool) ($options['use_path_style_endpoint'] ?? $config->provider === FilesystemProvider::Wasabi),
                'root' => $options['root_prefix'] ?? '',
                'throw' => true,
            ],
            FilesystemProvider::Ftp => [
                'driver' => 'ftp',
                'host' => $options['host'] ?? '',
                'username' => $credentials['username'] ?? '',
                'password' => $credentials['password'] ?? '',
                'port' => (int) ($options['port'] ?? 21),
                'root' => $options['root_path'] ?? '/',
                'passive' => (bool) ($options['passive'] ?? true),
                'ssl' => (bool) ($options['ssl'] ?? false),
                'throw' => true,
            ],
            FilesystemProvider::GoogleDrive => throw new InvalidArgumentException(
                'Google Drive uses the dedicated adapter — call GoogleDriveStorage instead.'
            ),
        };
    }

    public function verify(UserFilesystemConfig $config): void
    {
        if ($config->provider === FilesystemProvider::GoogleDrive) {
            app(GoogleDriveStorage::class)->verify($config);

            return;
        }

        $disk = $this->disk($config);
        $probe = '.wacloud-probe-'.uniqid();
        $disk->put($probe, 'ok');
        $disk->delete($probe);
    }
}
