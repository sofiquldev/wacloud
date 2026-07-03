<?php

namespace Tests\Unit;

use App\Support\HostingEnvironment;
use Tests\TestCase;

class HostingEnvironmentTest extends TestCase
{
    protected function tearDown(): void
    {
        putenv('REDIS_HOST');
        putenv('CACHE_STORE');
        putenv('BRIDGE_URL');
        putenv('WACLOUD_DOCKER');
        unset($_ENV['REDIS_HOST'], $_ENV['CACHE_STORE'], $_ENV['BRIDGE_URL'], $_ENV['WACLOUD_DOCKER']);

        parent::tearDown();
    }

    public function test_forces_file_drivers_when_redis_host_is_docker_only_outside_docker(): void
    {
        putenv('WACLOUD_DOCKER=0');
        putenv('REDIS_HOST=redis');
        putenv('CACHE_STORE=redis');
        $_ENV['WACLOUD_DOCKER'] = '0';
        $_ENV['REDIS_HOST'] = 'redis';
        $_ENV['CACHE_STORE'] = 'redis';

        $this->assertTrue(HostingEnvironment::shouldForceFileDrivers());
    }

    public function test_bridge_url_with_docker_hostname_is_not_configured_outside_docker(): void
    {
        putenv('WACLOUD_DOCKER=0');
        putenv('BRIDGE_URL=http://bridge:3001');
        $_ENV['WACLOUD_DOCKER'] = '0';
        $_ENV['BRIDGE_URL'] = 'http://bridge:3001';

        $this->assertFalse(HostingEnvironment::isBridgeConfigured());
    }

    public function test_public_bridge_url_is_configured_outside_docker(): void
    {
        putenv('WACLOUD_DOCKER=0');
        putenv('BRIDGE_URL=https://bridge.example.com');
        $_ENV['WACLOUD_DOCKER'] = '0';
        $_ENV['BRIDGE_URL'] = 'https://bridge.example.com';

        $this->assertTrue(HostingEnvironment::isBridgeConfigured());
    }

    public function test_is_docker_only_hostname(): void
    {
        $this->assertTrue(HostingEnvironment::isDockerOnlyHostname('redis'));
        $this->assertTrue(HostingEnvironment::isDockerOnlyHostname('bridge'));
        $this->assertFalse(HostingEnvironment::isDockerOnlyHostname('127.0.0.1'));
    }
}
