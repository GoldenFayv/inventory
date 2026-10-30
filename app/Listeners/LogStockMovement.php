<?php

namespace App\Listeners;

use App\Events\StockMovementRecorded;
use App\Enum\ActivityLoggerEvent;
use App\Support\ActivityLogger;

class LogStockMovement
{
    public function __construct(private ActivityLogger $activityLogger) {}

    public function handle(StockMovementRecorded $event): void
    {
        foreach ($event->movements as $movement) {
            $movement->loadMissing(['product', 'store']);

            $this->activityLogger->log(
                event: ActivityLoggerEvent::STOCK_MOVEMENT_RECORDED,
                causer: $event->user,
                store: $movement->store,
                subject: $movement,
                properties: [
                    'product_name' => $movement->product->name,
                    'movement_type' => $movement->movement_type->value,
                    'quantity' => $movement->quantity,
                ],
            );
        }
    }
}
