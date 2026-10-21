<?php

namespace App\Services;

use App\Enum\NotificationEventEnum;
use App\Enum\PermissionEnum;
use App\Models\NotificationDelivery;
use App\Models\Store;
use App\Notifications\Channels\TermiiSmsChannel;
use App\Notifications\Channels\WhatsAppCloudChannel;
use App\Notifications\StoreAlertNotification;
use Spatie\Permission\PermissionRegistrar;

class StoreNotificationService
{
    public function __construct(private SettingService $settingService, private PermissionRegistrar $permissionRegistrar,) {}

    public function notifyStoreMembers(Store $store, PermissionEnum $permission, NotificationEventEnum $event, string $title, string $message, string $url = '/',): void
    {
        $settings = $store->getNotifications();

        $channels = [];

        if ($settings['email'] ?? false) {
            $channels[] = 'tracked-mail';
        }

        if ($settings['email'] ?? false) {
            $channels[] = 'mail';
        }

        if ($settings['sms'] ?? false) {
            $channels[] = TermiiSmsChannel::class;
        }

        if ($settings['whatsapp'] ?? false) {
            $channels[] = WhatsAppCloudChannel::class;
        }

        if ($channels === []) {
            return;
        }

        $previousTeamId = $this->permissionRegistrar->getPermissionsTeamId();

        try {
            $this->permissionRegistrar->setPermissionsTeamId($store->getKey());

            $store->members()->with('user')->each(function ($member) use ($permission, $title, $message, $url, $channels, $store, $event) {
                $user = $member->user;

                if (! $user->email || ! $member->is_active) {
                    return;
                }

                if (! $member->hasPermissionTo($permission->value, 'user')) {
                    return;
                }

                foreach ($channels as $channel) {
                    $channelName = match ($channel) {
                        'tracked-mail' => 'mail',
                        TermiiSmsChannel::class => 'sms',
                        WhatsAppCloudChannel::class => 'whatsapp',
                        default => null,
                    };

                    if (! $channelName) {
                        continue;
                    }

                    $delivery = NotificationDelivery::create([
                        'store_id' => $store->getKey(),
                        'user_id' => $user->getKey(),
                        'event' => $event,
                        'channel' => $channelName,
                        'status' => 'queued',
                    ]);

                    $user->notify(new StoreAlertNotification($title, $message, $url, [$channel], $delivery->getKey()));
                }
            });
        } finally {
            $this->permissionRegistrar->setPermissionsTeamId($previousTeamId);
        }
    }
}
