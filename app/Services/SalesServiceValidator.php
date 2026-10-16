<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class SalesServiceValidator
{
    /**
     * Summary of validateSales
     * @param Collection<int, Product> $products
     * @param Collection $itemsByProductId
     * @param array $data
     * @return array
     */
    public function validateSales(Collection $products, Collection $itemsByProductId,  array $data)
    {
        $productIds = $itemsByProductId->keys()->sort()->values();
        // Also ensures every product belongs to this store.
        if ($products->count() !== $productIds->count()) {
            throw ValidationException::withMessages([
                'items' => 'Invalid product(s) selected',
            ]);
        }

        $data['total_amount'] = 0;
        $data['prepared_items'] = [];

        foreach ($itemsByProductId as $productId => $item) {
            $product = $products->get($productId);
            $quantity = (int) $item->quantity;

            if (! $product->is_active) {
                throw ValidationException::withMessages([
                    'items' => "{$product->name} is inactive.",
                ]);
            }

            if ($product->quantity < $quantity) {
                throw ValidationException::withMessages([
                    'items' => "Insufficient stock for {$product->name}.",
                ]);
            }

            $unitPrice = $product->selling_price;
            $subtotal = $unitPrice * $quantity;

            $data['total_amount'] += $subtotal;

            $data['prepared_items'][] = [
                'product' => $product,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
            ];
        }

        if ($data['amount'] > 0 && empty($data['payment_method'])) {
            throw ValidationException::withMessages([
                'payment_method' => 'Choose cash or transfer for the upfront payment.',
            ]);
        }

        if ($data['amount'] >= $data['total_amount']) {
            unset($data['due_date']);
        }

        return $data;
    }
}
