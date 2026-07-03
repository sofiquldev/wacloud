#!/usr/bin/env bash
# Fix public/uploads when Docker created root-owned files (chmod: Permission denied).
# Run from repo root: ./scripts/fix-upload-permissions.sh

set -euo pipefail
cd "$(dirname "$0")/.."

if command -v docker >/dev/null 2>&1 && docker compose ps app --status running -q 2>/dev/null | grep -q .; then
    echo "Fixing permissions via Docker (app container)..."
    docker compose exec -T app bash -c '
        set -euo pipefail
        cd /var/www/html
        host_uid="$(stat -c "%u" /var/www/html)"
        host_gid="$(stat -c "%g" /var/www/html)"
        mkdir -p public/uploads/members public/uploads/cms
        chown -R "${host_uid}:${host_gid}" public/uploads
        chmod -R 777 public/uploads
        echo "Done. public/uploads is owned by UID ${host_uid} and mode 777."
    '
    exit 0
fi

echo "Docker app container not running — fixing with sudo on host..."
sudo mkdir -p public/uploads/members public/uploads/cms
sudo chown -R "$(id -u):$(id -g)" public/uploads
chmod -R 775 public/uploads
echo "Done. public/uploads owned by $(id -un) and mode 775."
