<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case Mail = 'mail';
    case Sms = 'sms';
    case WhatsApp = 'whatsapp';

    public function requiresConsent(): bool
    {
        return $this !== self::Mail;
    }
}
