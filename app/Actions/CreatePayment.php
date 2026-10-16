<?php

namespace App\Actions;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Validation\ValidationException;

class CreatePayment
{
    public function handle(Invoice $invoice, int $amount, string $method): Payment
    {
        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount_paid' => 'Payment must be greater than zero.',
            ]);
        }

        return Payment::create([
            'reference' => generateReference(),
            'invoice_id' => $invoice->id,
            'amount' => $amount,
            'method' => $method,
        ]);
    }
}
