<?php

namespace App\Enums;

enum WhatsAppProvider: string
{
    case Web = 'web';
    case CloudApi = 'cloud_api';
    case Sandbox = 'sandbox';
}
