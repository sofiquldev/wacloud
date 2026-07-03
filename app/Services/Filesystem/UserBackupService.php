<?php

namespace App\Services\Filesystem;

use App\Enums\FilesystemProvider;
use App\Models\User;
use App\Models\UserFilesystemConfig;
use Illuminate\Support\Str;

class UserBackupService
{
    public function __construct(
        private UserFilesystemDiskFactory $diskFactory,
        private GoogleDriveStorage $googleDrive,
    ) {}

    public function defaultConfigFor(User $user): ?UserFilesystemConfig
    {
        return UserFilesystemConfig::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->orderByDesc('is_default')
            ->orderByDesc('updated_at')
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    public function buildPayload(User $user): array
    {
        $org = $user->currentOrganization();

        return [
            'version' => 1,
            'exported_at' => now()->toIso8601String(),
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
            ],
            'organization' => $org ? [
                'id' => $org->id,
                'name' => $org->name,
                'slug' => $org->slug,
            ] : null,
            'filesystem_configs' => UserFilesystemConfig::query()
                ->where('user_id', $user->id)
                ->get()
                ->map(fn (UserFilesystemConfig $c) => $c->toSafeArray())
                ->values()
                ->all(),
        ];
    }

    public function storeToConfig(User $user, UserFilesystemConfig $config): string
    {
        abort_unless($config->user_id === $user->id, 403);

        $payload = $this->buildPayload($user);
        $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $filename = 'wacloud-backup-'.$user->id.'-'.now()->format('Y-m-d-His').'.json';

        if ($config->provider === FilesystemProvider::GoogleDrive) {
            $this->googleDrive->upload($config, $filename, $json);
        } else {
            $path = trim(($config->options['backup_path'] ?? 'backups').'/'.$filename, '/');
            $this->diskFactory->disk($config)->put($path, $json);
        }

        $config->update(['last_backup_at' => now()]);

        return $filename;
    }
}
