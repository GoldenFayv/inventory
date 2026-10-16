<?php

namespace App\Actions;

use App\Models\Invoice;
use App\Models\User;

class GetInvoice
{
    public function handle(User $user, array $data): Invoice
    {
        $store = $user->active_store;

        return Invoice::create([
            'store_id' => $store->id,
            'generated_by' => $user->id,
            'reference' => generateReference("INV"),
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'customer_email' => $data['customer_email'] ?? null,
            'customer_address' => $data['customer_address'] ?? null,
            'customer_lga_id' => $data['customer_lga_id'] ?? null,
            'due_date' =>  $data['due_date'] ?? null,
        ]);
    }
}
