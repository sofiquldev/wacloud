<?php

namespace App\Enums;

enum WhatsAppAccountStatus: string
{
    case PendingQr = 'pending_qr';
    case Connected = 'connected';
    case Disconnected = 'disconnected';
    case Restricted = 'restricted';
}
