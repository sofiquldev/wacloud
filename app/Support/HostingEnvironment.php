<?php

namespace App\Support;

class HostingEnvironment
{
    /** Hostnames that only resolve inside the Docker Compose network. */
    private const DOCKER_ONLY_HOSTS = [
        'redis',
        'mysql',
        'bridge',
        'app',
        'nginx',
        'worker',
        'node',
    ];

    private static function envValue(string $key, mixed $default = null): mixed
    {
        if (array_key_exists($key, $_ENV)) {
            return $_ENV[$key];
        }

        $fromGetenv = getenv($key);

        if ($fromGetenv !== false) {
            return $fromGetenv;
        }

        return env($key, $default);
    }

    public static function runningInDocker(): bool
    {
        $flag = self::envValue('WACLOUD_DOCKER');

        if ($flag !== null) {
            return filter_var($flag, FILTER_VALIDATE_BOOLEAN);
        }

        return file_exists('/.dockerenv');
    }

    /** @return 'docker'|'shared' */
    public static function profile(): string
    {
        return self::runningInDocker() ? 'docker' : 'shared';
    }

    public static function isSharedHosting(): bool
    {
        return self::profile() === 'shared';
    }

    public static function isDockerOnlyHostname(?string $host): bool
    {
        if ($host === null || $host === '') {
            return false;
        }

        return in_array(strtolower($host), self::DOCKER_ONLY_HOSTS, true);
    }

    /**
     * Shared hosting often copies Docker .env values (REDIS_HOST=redis). Force file/sync drivers
     * so login, rate limiting, and artisan commands work without a Redis container.
     */
    public static function shouldForceFileDrivers(): bool
    {
        if (self::runningInDocker()) {
            return false;
        }

        $redisHost = strtolower((string) self::envValue('REDIS_HOST', ''));
        $cacheStore = strtolower((string) self::envValue('CACHE_STORE', ''));
        $queueConnection = strtolower((string) self::envValue('QUEUE_CONNECTION', ''));
        $sessionDriver = strtolower((string) self::envValue('SESSION_DRIVER', ''));

        if (self::isDockerOnlyHostname($redisHost)) {
            return true;
        }

        if ($cacheStore === 'redis' && ! self::canReachRedis()) {
            return true;
        }

        if ($queueConnection === 'redis' && ! self::canReachRedis()) {
            return true;
        }

        if ($sessionDriver === 'redis' && ! self::canReachRedis()) {
            return true;
        }

        return false;
    }

    public static function canReachRedis(): bool
    {
        $host = strtolower((string) self::envValue('REDIS_HOST', '127.0.0.1'));

        return ! self::isDockerOnlyHostname($host);
    }

    public static function isBridgeConfigured(): bool
    {
        $url = trim((string) self::envValue('BRIDGE_URL', ''));

        if ($url === '') {
            return false;
        }

        $host = parse_url($url, PHP_URL_HOST);

        if (self::isDockerOnlyHostname($host) && ! self::runningInDocker()) {
            return false;
        }

        return true;
    }

    public static function bridgeUnavailableMessage(): string
    {
        return 'WhatsApp Web bridge is not reachable from this server. Deploy the Node bridge on a VPS, set BRIDGE_URL to its public URL in .env, or enable organization sandbox mode for testing without WhatsApp.';
    }
}
