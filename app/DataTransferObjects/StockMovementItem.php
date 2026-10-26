<?php

namespace App\DataTransferObjects;

use Illuminate\Support\Collection;

final readonly class StockMovementItem
{
    public function __construct(public string $productId, public int $quantity, public ?int $unit_price = null) {}

    /**
     * @param  array{product_id: string, quantity: int}  $data
     */
    public static function fromArray(array $data): self
    {
        $unit_price = $data['unit_price'] ?? null;
        return new self(
            productId: $data['product_id'],
            quantity: (int) ($data['quantity'] ?? 0),
            unit_price: $unit_price !== null ? (int) $unit_price : null
        );
    }

    /**
     * @param  array<int, array>  $items
     * @return Collection<int, self>
     */
    public static function collect(array $items): Collection
    {
        return collect($items)->map(self::fromArray(...))->values();
    }
}
