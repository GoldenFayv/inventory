<?php

namespace App\DataTransferObjects;

use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

final readonly class RecordSalePayload
{
    /**
     * @param  Collection<int, StockMovementItem>|null  $items
     */
    public function __construct(
        public string $customer_name,
        public string $customer_phone,
        public Collection $items,
        public ?string $customer_email = null,
        public ?string $customer_address = null,
        public ?string $customer_lga_id = null,
        public ?string $payment_method = null,
        public ?string $due_date = null,
        public ?int $amount = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            customer_name: $data['customer_name'],
            customer_phone: $data['customer_phone'],
            items: StockMovementItem::collect($data['items']),
            customer_email: $data['customer_email'] ?? null,
            customer_address: $data['customer_address'] ?? null,
            customer_lga_id: $data['customer_lga_id'] ?? null,
            payment_method: $data['payment_method'] ?? null,
            due_date: $data['due_date'] ?? null,
            amount: $data['amount_paid'] ?? 0,
        );
    }

    /**
     * Only the fields that were actually provided. Zero and false are kept.
     */
    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn($value) => $value !== null);
    }

    /**
     * Just the columns that live on the invoice itself.
     */
    public function invoiceAttributes(): array
    {
        return Arr::only($this->toArray(), [
            'customer_name',
            'customer_phone',
            'customer_email',
            'customer_address',
            'customer_lga_id',
        ]);
    }
}
