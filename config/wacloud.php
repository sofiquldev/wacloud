<?php

return [

    'bridge_url' => env('BRIDGE_URL', 'http://bridge:3001'),

    'bridge_secret' => env('BRIDGE_SECRET', 'change-me-bridge-secret'),

    'send_delay_seconds' => (int) env('WHATSAPP_SEND_DELAY_SECONDS', 3),

    'send_burst_per_minute' => (int) env('WHATSAPP_SEND_BURST_PER_MINUTE', 20),

];
