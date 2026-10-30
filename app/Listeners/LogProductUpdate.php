<?php

namespace App\Listeners;

use App\Enum\ActivityLoggerEvent;
use App\Events\ProductUpdated;
use App\Support\ActivityLogger;

class LogProductUpdate
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(ProductUpdated $event): void
    {
        app(ActivityLogger::class)->log(
            event: ActivityLoggerEvent::PRODUCT_UPDATED,
            causer: $event->user,
            store: $event->product->store,
            subject: $event->product,
        );
    }
}
