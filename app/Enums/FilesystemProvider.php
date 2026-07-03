<?php

namespace App\Enums;

enum FilesystemProvider: string
{
    case S3 = 's3';
    case Wasabi = 'wasabi';
    case GoogleDrive = 'google_drive';
    case Ftp = 'ftp';

    public function label(): string
    {
        return match ($this) {
            self::S3 => 'Amazon S3 / compatible',
            self::Wasabi => 'Wasabi',
            self::GoogleDrive => 'Google Drive',
            self::Ftp => 'FTP',
        };
    }
}
