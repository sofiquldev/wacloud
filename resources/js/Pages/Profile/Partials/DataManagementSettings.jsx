import {
    clearUserMediaCache,
    formatBytes,
    getMediaCacheStats,
    loadUserDataSettings,
    saveUserDataSettings,
} from '@/utils/userDataStore';
import { usePage } from '@inertiajs/react';
import { Database, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const labelClass = 'text-sm font-medium text-foreground';
const helpClass = 'mt-1 text-xs text-muted-foreground';

export default function DataManagementSettings() {
    const user = usePage().props.auth.user;
    const userId = user?.id;

    const [settings, setSettings] = useState(() => loadUserDataSettings(userId));
    const [cacheStats, setCacheStats] = useState({ count: 0, bytes: 0 });
    const [status, setStatus] = useState('');
    const [busy, setBusy] = useState(false);

    const refreshStats = useCallback(async () => {
        if (!userId) {
            return;
        }
        const stats = await getMediaCacheStats(userId);
        setCacheStats(stats);
    }, [userId]);

    useEffect(() => {
        refreshStats();
    }, [refreshStats]);

    const persist = (next) => {
        setSettings(next);
        saveUserDataSettings(userId, next);
    };

    const handleClearCache = async () => {
        if (!window.confirm('Clear all media cached in this browser for your account?')) {
            return;
        }
        setBusy(true);
        await clearUserMediaCache(userId);
        await refreshStats();
        setStatus('Local media cache cleared.');
        setBusy(false);
    };

    if (!userId) {
        return null;
    }

    return (
        <div>
            <header className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Browser media cache</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Media previews can be cached in this browser for faster inbox loading. This is separate
                    from your cloud filesystem credentials below — each user has an isolated browser cache.
                </p>
            </header>

            <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-civic/10 p-2 text-civic">
                        <Database className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className={labelClass}>Local cache</p>
                        <p className={helpClass}>
                            Stored in IndexedDB on this device only. Does not sync to other browsers.
                        </p>
                        <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={settings.mediaCacheEnabled}
                                onChange={(e) =>
                                    persist({ ...settings, mediaCacheEnabled: e.target.checked })
                                }
                                className="rounded border-border text-civic focus:ring-civic"
                            />
                            Enable local media cache
                        </label>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span>
                                {cacheStats.count} items · {formatBytes(cacheStats.bytes)}
                            </span>
                            <button
                                type="button"
                                onClick={refreshStats}
                                className="inline-flex items-center gap-1 text-civic hover:underline"
                            >
                                <RefreshCw className="size-3.5" />
                                Refresh
                            </button>
                            <button
                                type="button"
                                onClick={handleClearCache}
                                disabled={busy || cacheStats.count === 0}
                                className="inline-flex items-center gap-1 text-destructive hover:underline disabled:opacity-50"
                            >
                                <Trash2 className="size-3.5" />
                                Clear cache
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {status && (
                <p className="mt-4 rounded-lg border border-civic/20 bg-civic/5 px-3 py-2 text-sm text-foreground">
                    {status}
                </p>
            )}
        </div>
    );
}
