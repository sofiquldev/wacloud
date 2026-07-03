<?php

return [

    'bridge_url' => env('BRIDGE_URL', ''),

    'bridge_secret' => env('BRIDGE_SECRET', 'change-me-bridge-secret'),

    /** Set at runtime in AppServiceProvider — false on shared hosting when BRIDGE_URL points at Docker. */
    'bridge_available' => false,

    'send_delay_seconds' => (int) env('WHATSAPP_SEND_DELAY_SECONDS', 3),

    'send_burst_per_minute' => (int) env('WHATSAPP_SEND_BURST_PER_MINUTE', 20),

];
