<?php

namespace App\Actions;

use App\Models\Invoice;

class AttachItemsToInvoice
{
    public function handle(Invoice $invoice, array $data)
    {
        $items = [];

        foreach ($data as $item) {
            $product = $item['product'];
            
            $items[] = [
                'invoice_id' => $invoice->id,
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'subtotal' => $item['subtotal'],
            ];
        }

        return $invoice->items()->createMany($items);
    }
}
