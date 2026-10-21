<?php

namespace App\Notifications\Channels;

use App\Notifications\StoreAlertNotification;
use App\Services\NotificationDeliveryService;
use Illuminate\Notifications\Channels\MailChannel;

class TrackedMailChannel
{
    public function __construct(private MailChannel $mailChannel, private NotificationDeliveryService $deliveryService,) {}

    public function send(object $notifiable, StoreAlertNotification $notification): void
    {
        $mailMessage = $notification->toMail($notifiable);

        $this->mailChannel->send($notifiable, $notification);

        // Laravel's built-in MailChannel doesn't expose the provider
        // message ID here. Record acceptance after send() succeeds.
        $this->deliveryService->accepted($notification->deliveryId);
    }
}
