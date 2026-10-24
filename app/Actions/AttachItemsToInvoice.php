<?php

namespace App\Actions;

use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class AttachItemsToInvoice
{
    public function handle(Invoice $invoice, array $data)
    {
        return DB::transaction(function () use ($invoice, $data) {
            // 1. Collapse duplicate products within the payload
            $incoming = collect($data)
                ->groupBy(fn($item) => $item['product']->id)
                ->map(fn($rows, $productId) => [
                    'product_id' => $productId,
                    'quantity'   => $rows->sum('quantity'),
                    'unit_price' => $rows->last()['unit_price'],
                    'asking_price' => $rows->last()['asking_price'] ?? null
                ]);

            // 2. Load lines already on the invoice (locked to avoid races)
            $existing = $invoice->items()
                ->whereIn('product_id', $incoming->keys())
                ->lockForUpdate()
                ->get()
                ->keyBy('product_id');

            foreach ($incoming as $productId => $row) {
                if ($item = $existing->get($productId)) {
                    $quantity = $item->quantity + $row['quantity'];

                    $item->update([
                        'quantity'   => $quantity,
                        'unit_price' => $row['unit_price'],
                        'subtotal'   => $quantity * $row['unit_price'],
                    ]);
                } else {
                    $invoice->items()->create([
                        'product_id' => $productId,
                        'quantity'   => $row['quantity'],
                        'unit_price' => $row['unit_price'],
                        'asking_price' => $row['asking_price'],
                        'subtotal'   => $row['quantity'] * $row['unit_price'],
                    ]);
                }
            }

            return $invoice->items()->get();
        });
    }
}
