<?php

namespace App\Actions\Products;

use App\Enum\SalesReturnStatus;
use App\Models\Invoice;
use App\Models\SalesReturn;
use App\Models\User;

class GetSaleReturn
{
    public function handle(Invoice $invoice, User $user, ?string $reason = null): SalesReturn
    {
        return SalesReturn::firstOrCreate(
            [
                'invoice_id' => $invoice->getKey(),
                'status' => SalesReturnStatus::PENDING,
                'store_id' => $user->active_store_id,
            ],
            [
                'reference' => generateReference('RET'),
                'reason' => $reason,
                'requested_by' => $user->getKey(),
            ]
        );
    }
}
