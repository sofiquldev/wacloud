<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserFilesystemConfigRequest;
use App\Http\Requests\UpdateUserFilesystemConfigRequest;
use App\Models\UserFilesystemConfig;
use App\Services\Filesystem\UserBackupService;
use App\Services\Filesystem\UserFilesystemDiskFactory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserFilesystemConfigController extends Controller
{
    public function store(StoreUserFilesystemConfigRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $isFirst = ! UserFilesystemConfig::query()->where('user_id', $user->id)->exists();

        UserFilesystemConfig::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'provider' => $validated['provider'],
            'credentials' => $validated['credentials'] ?? [],
            'options' => $validated['options'] ?? [],
            'is_default' => $validated['is_default'] ?? $isFirst,
            'is_active' => true,
        ]);

        return back()->with('status', 'filesystem-saved');
    }

    public function update(UpdateUserFilesystemConfigRequest $request, UserFilesystemConfig $userFilesystemConfig): RedirectResponse
    {
        $validated = $request->validated();

        if (isset($validated['credentials'])) {
            $userFilesystemConfig->credentials = array_merge(
                $userFilesystemConfig->credentials ?? [],
                array_filter($validated['credentials'], fn ($v) => $v !== null && $v !== ''),
            );
            unset($validated['credentials']);
        }

        if (isset($validated['options'])) {
            $userFilesystemConfig->options = array_merge($userFilesystemConfig->options ?? [], $validated['options']);
            unset($validated['options']);
        }

        $userFilesystemConfig->fill($validated);
        $userFilesystemConfig->save();

        return back()->with('status', 'filesystem-updated');
    }

    public function destroy(Request $request, UserFilesystemConfig $userFilesystemConfig): RedirectResponse
    {
        abort_unless($userFilesystemConfig->user_id === $request->user()->id, 403);

        $wasDefault = $userFilesystemConfig->is_default;
        $userId = $userFilesystemConfig->user_id;
        $userFilesystemConfig->delete();

        if ($wasDefault) {
            UserFilesystemConfig::query()
                ->where('user_id', $userId)
                ->latest('updated_at')
                ->first()
                ?->update(['is_default' => true]);
        }

        return back()->with('status', 'filesystem-deleted');
    }

    public function setDefault(Request $request, UserFilesystemConfig $userFilesystemConfig): RedirectResponse
    {
        abort_unless($userFilesystemConfig->user_id === $request->user()->id, 403);

        $userFilesystemConfig->update(['is_default' => true, 'is_active' => true]);

        return back()->with('status', 'filesystem-default');
    }

    public function test(Request $request, UserFilesystemConfig $userFilesystemConfig, UserFilesystemDiskFactory $factory): RedirectResponse
    {
        abort_unless($userFilesystemConfig->user_id === $request->user()->id, 403);

        try {
            $factory->verify($userFilesystemConfig);
            $userFilesystemConfig->update(['last_verified_at' => now()]);

            return back()->with('status', 'filesystem-verified');
        } catch (\Throwable $e) {
            return back()->withErrors(['filesystem' => $e->getMessage()]);
        }
    }

    public function backup(Request $request, UserBackupService $backupService): RedirectResponse
    {
        $user = $request->user();
        $config = $backupService->defaultConfigFor($user);

        if (! $config) {
            return back()->withErrors([
                'filesystem' => 'Add a filesystem configuration before running a backup.',
            ]);
        }

        try {
            $filename = $backupService->storeToConfig($user, $config);

            return back()->with('status', "backup-stored:{$filename}");
        } catch (\Throwable $e) {
            return back()->withErrors(['filesystem' => $e->getMessage()]);
        }
    }
}
