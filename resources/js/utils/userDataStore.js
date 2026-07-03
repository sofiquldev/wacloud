const DB_NAME = 'wacloud-user-data';
const DB_VERSION = 1;
const MEDIA_STORE = 'media_cache';
const SETTINGS_PREFIX = 'wacloud:user:';

const defaultSettings = () => ({
    mediaCacheEnabled: true,
    maxCacheMb: 100,
    backupDestination: 'download',
    lastBackupAt: null,
    googleDriveConnected: false,
});

function settingsKey(userId) {
    return `${SETTINGS_PREFIX}${userId}:settings`;
}

export function loadUserDataSettings(userId) {
    if (!userId || typeof window === 'undefined') {
        return defaultSettings();
    }
    try {
        const raw = localStorage.getItem(settingsKey(userId));
        if (!raw) {
            return defaultSettings();
        }
        return { ...defaultSettings(), ...JSON.parse(raw) };
    } catch {
        return defaultSettings();
    }
}

export function saveUserDataSettings(userId, settings) {
    if (!userId || typeof window === 'undefined') {
        return;
    }
    localStorage.setItem(settingsKey(userId), JSON.stringify(settings));
}

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(MEDIA_STORE)) {
                db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function mediaKey(userId, mediaId) {
    return `${userId}:${mediaId}`;
}

export async function getMediaCacheStats(userId) {
    if (!userId) {
        return { count: 0, bytes: 0 };
    }
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_STORE, 'readonly');
        const store = tx.objectStore(MEDIA_STORE);
        const request = store.getAll();
        request.onsuccess = () => {
            const rows = (request.result ?? []).filter((r) => String(r.id).startsWith(`${userId}:`));
            const bytes = rows.reduce((sum, r) => sum + (r.size ?? 0), 0);
            resolve({ count: rows.length, bytes });
        };
        request.onerror = () => reject(request.error);
    });
}

export async function clearUserMediaCache(userId) {
    if (!userId) {
        return;
    }
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_STORE, 'readwrite');
        const store = tx.objectStore(MEDIA_STORE);
        const request = store.getAllKeys();
        request.onsuccess = () => {
            const prefix = `${userId}:`;
            for (const key of request.result ?? []) {
                if (String(key).startsWith(prefix)) {
                    store.delete(key);
                }
            }
            tx.oncomplete = () => resolve();
        };
        request.onerror = () => reject(request.error);
    });
}

export async function buildUserBackup(userId, settings) {
    const mediaStats = await getMediaCacheStats(userId);
    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        userId,
        settings,
        mediaCache: mediaStats,
    };
}

export function downloadBackupJson(backup, filename) {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? `wacloud-backup-${backup.userId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function saveBackupToFilesystem(backup, suggestedName) {
    if (!window.showSaveFilePicker) {
        downloadBackupJson(backup, suggestedName);
        return 'download';
    }
    const handle = await window.showSaveFilePicker({
        suggestedName: suggestedName ?? `wacloud-backup-${backup.userId}.json`,
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(backup, null, 2));
    await writable.close();
    return 'filesystem';
}

export function importBackupFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                resolve(data);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

/**
 * Upload backup JSON to Google Drive (requires VITE_GOOGLE_CLIENT_ID).
 * Falls back to download if the API is unavailable.
 */
export async function uploadBackupToGoogleDrive(backup, clientId) {
    if (!clientId) {
        downloadBackupJson(backup);
        return { ok: false, reason: 'no_client_id' };
    }

    const token = await new Promise((resolve, reject) => {
        if (!window.google?.accounts?.oauth2) {
            reject(new Error('Google Identity Services not loaded'));
            return;
        }
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (resp) => {
                if (resp.error) {
                    reject(new Error(resp.error));
                } else {
                    resolve(resp.access_token);
                }
            },
        });
        client.requestAccessToken();
    });

    const metadata = {
        name: `wacloud-backup-${backup.userId}-${Date.now()}.json`,
        mimeType: 'application/json',
    };
    const boundary = 'wacloud_boundary';
    const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
        `${JSON.stringify(backup)}\r\n` +
        `--${boundary}--`;

    const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body,
        },
    );

    if (!res.ok) {
        throw new Error('Google Drive upload failed');
    }

    return { ok: true };
}

export function formatBytes(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
