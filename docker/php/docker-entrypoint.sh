#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

# Bind-mounted repos often have no vendor/ after clone; install once before artisan or FPM need it.
if [[ ! -f vendor/autoload.php ]] && [[ -f composer.json ]]; then
    echo "wacloud-docker-entrypoint: installing Composer dependencies..."
    git config --global --add safe.directory /var/www/html 2>/dev/null || true
    composer install --no-interaction --prefer-dist
fi

# When using MySQL/MariaDB (e.g. compose profile `mysql`), FPM often starts before the server accepts connections.
if [[ "${DB_CONNECTION:-}" == "mysql" || "${DB_CONNECTION:-}" == "mariadb" ]]; then
    echo "wacloud-docker-entrypoint: waiting for ${DB_CONNECTION} at ${DB_HOST:-mysql}:${DB_PORT:-3306}..."
    php -r '
        $h = getenv("DB_HOST") ?: "mysql";
        $p = (int) (getenv("DB_PORT") ?: 3306);
        // Use root for readiness — app credentials may not exist yet on an existing volume.
        $u = "root";
        $w = getenv("DB_ROOT_PASSWORD") ?: "rootsecret";
        $dsn = "mysql:host={$h};port={$p}";
        $last = null;
        $max = (int) (getenv("MYSQL_WAIT_SECONDS") ?: 90);
        for ($i = 0; $i < $max; $i++) {
            try {
                new PDO($dsn, $u, $w, [PDO::ATTR_TIMEOUT => 3]);
                fwrite(STDOUT, "wacloud-docker-entrypoint: database is accepting connections\n");
                exit(0);
            } catch (Throwable $e) {
                $last = $e;
                sleep(1);
            }
        }
        fwrite(STDERR, "wacloud-docker-entrypoint: gave up after {$max}s: ".($last ? $last->getMessage() : "unknown")."\n");
        exit(1);
    '
fi

# Writable paths for Laravel (Blade compile, cache, logs, sessions).
mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    public/uploads/members \
    public/uploads/cms

# SQLite needs the DB file writable by PHP-FPM (www-data). Do not chown the whole
# database/ tree — that breaks editing migrations/seeders on a bind-mounted repo.
mkdir -p database/migrations database/seeders database/factories
touch database/database.sqlite 2>/dev/null || true

chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache

# Bind-mount owner (host user) — used for versioned paths and public/uploads.
host_uid="$(stat -c '%u' /var/www/html 2>/dev/null || echo 0)"
host_gid="$(stat -c '%g' /var/www/html 2>/dev/null || echo 0)"

# Member/CMS files under public/uploads/. FPM may create files as root on first upload;
# normalize ownership to the host user and mode so both `ds` and www-data can write.
if [[ "$host_uid" != "0" ]]; then
    chown -R "${host_uid}:${host_gid}" public/uploads 2>/dev/null || true
fi
if [[ "${APP_ENV:-local}" == "local" ]]; then
    chmod -R 777 public/uploads 2>/dev/null || true
else
    chmod -R ug+rwx public/uploads 2>/dev/null || true
    chmod o+rwx public/uploads public/uploads/members public/uploads/cms 2>/dev/null || true
fi

if [[ "$host_uid" != "0" ]]; then
    chown -R "${host_uid}:${host_gid}" database/migrations database/seeders database/factories 2>/dev/null || true
    chown "${host_uid}:${host_gid}" database 2>/dev/null || true
fi
chown www-data:www-data database/database.sqlite 2>/dev/null || true
chmod ug+rw database/database.sqlite 2>/dev/null || true

# If SQLite uses WAL, it creates files next to database.sqlite; FPM (www-data) must be able to write
# this directory even when the bind-mount owner is the host UID (see config database.sqlite journal_mode).
chmod o+w database 2>/dev/null || true

exec docker-php-entrypoint "$@"
