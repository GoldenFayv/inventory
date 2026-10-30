<?php

namespace App\Listeners;

use App\Events\SaleUpdated;
use App\Enum\ActivityLoggerEvent;
use App\Support\ActivityLogger;

class LogSaleUpdate
{
    public function __construct(
        private ActivityLogger $activityLogger
    ) {}

    public function handle(SaleUpdated $event): void
    {
        $before = $event->before;
        $after = $event->after;

        $this->activityLogger->log(
            event: ActivityLoggerEvent::SALE_UPDATED,
            causer: $event->user,
            store: $event->invoice->store,
            subject: $event->invoice,
            attributeChanges: [
                'reference' => $event->invoice->reference,

                'changes' => [
                    'total_amount' => [
                        'old' => $before['total_amount'],
                        'new' => $after['total_amount'],
                    ],
                    'total_amount_paid' => [
                        'old' => $before['total_amount_paid'],
                        'new' => $after['total_amount_paid'],
                    ],
                    'items_added' => $this->getAddedRecords(
                        $before['items'],
                        $after['items']
                    ),
                    'payments_added' => $this->getAddedRecords(
                        $before['payments'],
                        $after['payments']
                    ),
                ],
            ],
        );
    }

    private function getAddedRecords(array $before, array $after): array
    {
        $existingIds = collect($before)->pluck('id')->all();

        return collect($after)
            ->reject(fn($item) => in_array($item['id'], $existingIds, true))
            ->values()
            ->all();
    }
}
