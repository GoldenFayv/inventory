<?php

namespace App\Listeners;

use App\Events\SaleUpdated;
use App\Enum\ActivityLoggerEvent;
use App\Support\ActivityLogger;

class LogSaleUpdate
{
    public function __construct(private ActivityLogger $activityLogger) {}

    public function handle(SaleUpdated $event): void
    {
        $invoice = $event->invoice->loadMissing(['items.product', 'payments', 'store']);

        $this->activityLogger->log(
            event: ActivityLoggerEvent::SALE_UPDATED,
            causer: $event->user,
            store: $invoice->store,
            subject: $invoice,
            properties: [
                'reference' => $invoice->reference,
                'total_amount' => $invoice->total_amount,
                'total_amount_paid' => $invoice->total_amount_paid,
                'items' => $invoice->items->map(fn($item) => [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product?->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ])->values()->all(),
                'payments' => $invoice->payments->map(fn($payment) => [
                    'amount' => $payment->amount,
                    'method' => $payment->method,
                ])->values()->all(),
            ],
        );
    }
}
