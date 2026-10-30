<?php

namespace App\Listeners;

use App\Enum\ActivityLoggerEvent;
use App\Events\SaleRecorded;
use App\Models\Payment;
use App\Support\ActivityLogger;

class LogSaleCreation
{
    public function __construct(
        private ActivityLogger $activityLogger
    ) {}

    public function handle(SaleRecorded $event): void
    {
        $invoice = $event->invoice;

        $this->activityLogger->log(
            event: ActivityLoggerEvent::SALE_CREATED,
            causer: $invoice->user,
            store: $invoice->store,
            subject: $invoice,
            properties: [
                'reference' => $invoice->reference,
                'total_amount' => $invoice->total_amount,
                'total_amount_paid' => $invoice->total_amount_paid,
                'items' => $invoice->items->map(fn($item) => [
                    'product' => $item->product?->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ])->values()->all(),
                'payments' => $invoice->payments->map(fn(Payment $payment) => [
                    'amount' => $payment->amount,
                    'method' => $payment->method,
                ])->values()->all(),
            ],
        );
    }
}
