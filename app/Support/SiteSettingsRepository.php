<?php

namespace App\Support;

use Illuminate\Support\Facades\File;

class SiteSettingsRepository
{
    private const FILE = 'site_settings.json';

    public function defaultPath(): string
    {
        return resource_path('data/'.self::FILE);
    }

    public function storagePath(): string
    {
        return storage_path('app/'.self::FILE);
    }

    /**
     * @return array<string, mixed>
     */
    public function defaults(): array
    {
        $path = $this->defaultPath();
        if (! File::exists($path)) {
            return [];
        }

        $decoded = json_decode(File::get($path), true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @return array<string, mixed>
     */
    public function load(): array
    {
        $merged = $this->defaults();
        $custom = $this->storagePath();
        if (File::exists($custom)) {
            $decoded = json_decode(File::get($custom), true);
            if (is_array($decoded)) {
                $merged = array_merge($merged, $decoded);
            }
        }

        return $merged;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function save(array $data): void
    {
        $path = $this->storagePath();
        $dir = dirname($path);
        if (! File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }
        File::put(
            $path,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)
        );
    }

    public function publicDiskUrl(?string $relativePath): ?string
    {
        if ($relativePath === null || $relativePath === '') {
            return null;
        }

        return PublicStorageUrl::fromPublicDiskPath($relativePath);
    }

    /**
     * Props for public Inertia pages (header, footer, favicon).
     *
     * @return array<string, mixed>
     */
    public function forPublic(): array
    {
        $s = $this->load();
        $year = (int) date('Y');
        $org = (string) ($s['footerOrganizationShort'] ?? '');
        $logoAlign = $s['logoAlign'] ?? 'left';
        if (! in_array($logoAlign, ['left', 'center', 'right'], true)) {
            $logoAlign = 'left';
        }

        return [
            'appTitleBn' => (string) ($s['appTitleBn'] ?? ''),
            'appTitleEn' => (string) ($s['appTitleEn'] ?? ''),
            'logoMode' => in_array($s['logoMode'] ?? 'builtin', ['builtin', 'image'], true) ? $s['logoMode'] : 'builtin',
            'logoImageUrl' => ($s['logoMode'] ?? '') === 'image'
                ? $this->publicDiskUrl($s['logoImagePath'] ?? null)
                : null,
            'logoSealLine1' => (string) ($s['logoSealLine1'] ?? 'POURA'),
            'logoSealLine2' => (string) ($s['logoSealLine2'] ?? 'SEAL'),
            'logoShowBanglaTitle' => (bool) ($s['logoShowBanglaTitle'] ?? true),
            'logoShowEnglishTitle' => (bool) ($s['logoShowEnglishTitle'] ?? true),
            'logoBuiltinPreset' => in_array($s['logoBuiltinPreset'] ?? 'official', ['official', 'classic'], true)
                ? $s['logoBuiltinPreset']
                : 'official',
            'logoShowTitles' => ! in_array($s['logoShowTitles'] ?? true, [false, 0, '0', 'false', ''], true),
            'logoAlign' => $logoAlign,
            'noticeTickerEnabled' => ! in_array($s['noticeTickerEnabled'] ?? true, [false, 0, '0', 'false', ''], true),
            'faviconUrl' => $this->publicDiskUrl($s['faviconPath'] ?? null),
            'footerIntroTitle' => (string) ($s['footerIntroTitle'] ?? ''),
            'footerIntroBody' => (string) ($s['footerIntroBody'] ?? ''),
            'footerAddress' => (string) ($s['footerAddress'] ?? ''),
            'footerPhone' => (string) ($s['footerPhone'] ?? ''),
            'footerEmail' => (string) ($s['footerEmail'] ?? ''),
            'footerCreditLine' => (string) ($s['footerCreditLine'] ?? ''),
            'footerCopyrightTemplate' => (string) ($s['footerCopyrightTemplate'] ?? ''),
            'footerOrganizationShort' => $org,
            'currentYear' => $year,
            'customHeadCss' => (string) ($s['customHeadCss'] ?? ''),
            'customBodyJs' => (string) ($s['customBodyJs'] ?? ''),
        ];
    }

    /**
     * Raw merged settings for the admin form (includes storage paths).
     *
     * @return array<string, mixed>
     */
    public function forAdmin(): array
    {
        $s = $this->load();

        return array_merge($s, [
            'logoImageUrl' => $this->publicDiskUrl($s['logoImagePath'] ?? null),
            'faviconUrl' => $this->publicDiskUrl($s['faviconPath'] ?? null),
            'storageWritable' => is_writable(storage_path('app')),
            'publicDiskLinked' => File::exists(public_path('storage')),
        ]);
    }
}
