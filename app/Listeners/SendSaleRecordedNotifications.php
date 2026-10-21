<?php

namespace App\Listeners;

use App\Enum\NotificationEventEnum;
use App\Enum\PermissionEnum;
use App\Events\SaleRecorded;
use App\Services\StoreNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendSaleRecordedNotifications implements ShouldQueue
{
    use Queueable, InteractsWithQueue;

    public function __construct(private StoreNotificationService $notificationService) {}

    public function handle(SaleRecorded $event): void
    {
        $invoice = $event->invoice;
        $store = $invoice->store;

        if (! $store) {
            return;
        }
        $notificationEvent = NotificationEventEnum::SALE_RECORDED;
        $this->notificationService->notifyStoreMembers($store, PermissionEnum::NOTIFICATIONS_SALES_RECEIVE, $notificationEvent, $notificationEvent->title(), $notificationEvent->description(), '/sales',);
    }
}
