<?php

namespace App\Domains\WhatsApp\Exceptions;

use App\Support\HostingEnvironment;
use RuntimeException;

class BridgeUnavailableException extends RuntimeException
{
    public static function notConfigured(): self
    {
        return new self(HostingEnvironment::bridgeUnavailableMessage());
    }
}
