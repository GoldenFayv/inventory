<?php

namespace App\Listeners;

use App\Events\ProductCreated;
use App\Enum\ActivityLoggerEvent;
use App\Support\ActivityLogger;

class LogProductCreation
{
    public function __construct(private ActivityLogger $activityLogger) {}

    public function handle(ProductCreated $event): void
    {
        $this->activityLogger->log(
            event: ActivityLoggerEvent::PRODUCT_CREATED,
            causer: $event->user,
            store: $event->product->store,
            subject: $event->product,
            properties: [
                'opening_quantity' => $event->product->quantity,
            ],
        );
    }
}
