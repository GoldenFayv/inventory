<?php

namespace App\Actions\Products;

use App\Enum\SalesReturnStatus;
use App\Models\Invoice;
use App\Models\SalesReturn;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RejectSalesReturn
{
    public function handle(User $user, string $returnId, Invoice $invoice, ?string $note = null)
    {
        $invoiceId = $invoice->getKey();
        
        return DB::transaction(function () use ($user, $returnId, $note, $invoiceId): SalesReturn {
            $return = SalesReturn::query()->where('invoice_id', $invoiceId)->lockForUpdate()->findOrFail($returnId);

            $return->update([
                'status' => SalesReturnStatus::REJECTED,
                'approved_by' => $user->getKey(),
                'approval_note' => $note,
            ]);

            return $return->fresh()->load('items', 'invoice');
        });
    }
}
