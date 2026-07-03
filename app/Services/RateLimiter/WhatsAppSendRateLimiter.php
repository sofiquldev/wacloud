<?php

namespace App\Services\RateLimiter;

use Illuminate\Support\Facades\Redis;

class WhatsAppSendRateLimiter
{
    public function throttle(int $accountId): void
    {
        $delay = config('wacloud.send_delay_seconds', 3);
        $burst = config('wacloud.send_burst_per_minute', 20);
        $minuteKey = "wa:rate:{$accountId}:".now()->format('YmdHi');

        $count = (int) Redis::incr($minuteKey);
        if ($count === 1) {
            Redis::expire($minuteKey, 120);
        }

        if ($count > $burst) {
            sleep(min(30, $delay * 2));
        } else {
            sleep(random_int(max(1, $delay - 1), $delay + 2));
        }
    }
}
