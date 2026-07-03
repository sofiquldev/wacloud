<?php

namespace App\Support;

use App\Models\Member;
use Illuminate\Support\Facades\File;

/**
 * Static copy of public information mirrored from https://pabnapourashava.gov.bd/
 * (structure and listings as shown on the homepage). Custom nav URLs are placeholders
 * until remapped in Admin → Menus to internal pages or exact official paths.
 */
class PabnaOfficialSiteData
{
    private const NAV_JSON = __DIR__.'/data/pabna_official_nav.json';

    /**
     * @return array<int, mixed>
     */
    public static function navMenuItems(): array
    {
        if (! File::exists(self::NAV_JSON)) {
            return [];
        }
        $decoded = json_decode(File::get(self::NAV_JSON), true);
        if (! is_array($decoded) || ! isset($decoded['items']) || ! is_array($decoded['items'])) {
            return [];
        }

        return $decoded['items'];
    }

    public static function seedMembers(): void
    {
        foreach (self::memberRows() as $row) {
            Member::query()->updateOrCreate(
                ['name' => $row['name']],
                $row,
            );
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function memberRows(): array
    {
        $session = 's-2024';

        return [
            [
                'name' => 'মনিরুজ্জামান',
                'designation' => 'Mayor',
                'ward' => 'Pourashava (city-wide)',
                'session_id' => $session,
                'phone' => self::normalizeBdPhone('01332853403'),
                'email' => null,
                'status' => 'active',
                'public_message' => null,
            ],
            [
                'name' => 'মোহাম্মদ দুলাল উদ্দিন',
                'designation' => 'Councilor',
                'ward' => null,
                'session_id' => $session,
                'phone' => null,
                'email' => null,
                'status' => 'active',
                'public_message' => null,
            ],
            [
                'name' => 'ডাঃ মোহাম্মাদ খায়রুল কবির',
                'designation' => 'Councilor',
                'ward' => null,
                'session_id' => $session,
                'phone' => self::normalizeBdPhone('01715-440007'),
                'email' => null,
                'status' => 'active',
                'public_message' => null,
            ],
            [
                'name' => 'ড. মোঃ জামাল উদ্দীন',
                'designation' => 'Councilor',
                'ward' => null,
                'session_id' => $session,
                'phone' => self::normalizeBdPhone('01712272859'),
                'email' => null,
                'status' => 'active',
                'public_message' => null,
            ],
            [
                'name' => 'মোঃ রাশেদ কবির',
                'designation' => 'Councilor',
                'ward' => null,
                'session_id' => $session,
                'phone' => self::normalizeBdPhone('01828171823'),
                'email' => null,
                'status' => 'active',
                'public_message' => null,
            ],
            [
                'name' => 'মোঃ মনিরুল ইসলাম',
                'designation' => 'Councilor',
                'ward' => null,
                'session_id' => $session,
                'phone' => self::normalizeBdPhone('01716385951'),
                'email' => null,
                'status' => 'active',
                'public_message' => null,
            ],
            [
                'name' => 'মোঃ আতিকুল ইসলাম',
                'designation' => 'Councilor',
                'ward' => null,
                'session_id' => $session,
                'phone' => self::normalizeBdPhone('01711080486'),
                'email' => null,
                'status' => 'active',
                'public_message' => null,
            ],
            [
                'name' => 'মোঃ রোস্তম আলী',
                'designation' => 'Councilor',
                'ward' => null,
                'session_id' => $session,
                'phone' => self::normalizeBdPhone('01708573806'),
                'email' => null,
                'status' => 'active',
                'public_message' => null,
            ],
            [
                'name' => 'সিদ্দীক মোহাম্মদ ইউসুফ রেজা',
                'designation' => 'Councilor',
                'ward' => null,
                'session_id' => $session,
                'phone' => self::normalizeBdPhone('01712676000'),
                'email' => null,
                'status' => 'active',
                'public_message' => null,
            ],
        ];
    }

    private static function normalizeBdPhone(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }
        $digits = preg_replace('/\D+/', '', $raw) ?? '';
        if ($digits === '') {
            return null;
        }
        if (str_starts_with($digits, '880')) {
            return '+'.$digits;
        }
        if (str_starts_with($digits, '0')) {
            return '+880'.substr($digits, 1);
        }

        return '+880'.$digits;
    }
}
