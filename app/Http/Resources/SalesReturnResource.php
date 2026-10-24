<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesReturnResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_id' => $this->store_id,
            'invoice_id' => $this->invoice_id,
            'reference' => $this->reference,

            'invoice' => $this->whenLoaded('invoice', fn() => new InvoiceResource($this->invoice)),

            'status' => $this->status,
            'reason' => $this->reason,

            // All monetary amounts are stored in kobo.
            'total_amount' => $this->total_amount_naira,
            'debt_reduction_amount' => $this->debt_reduction_amount_naira,
            'customer_credit_amount' => $this->customer_credit_amount_naira,

            'requested_by' => $this->requested_by,
            'requester' => $this->whenLoaded('requester', function () {
                return $this->requester ? [
                    'id' => $this->requester->id,
                    'first_name' => $this->requester->first_name,
                    'last_name' => $this->requester->last_name,
                ] : null;
            }),

            'approved_by' => $this->approved_by,
            'approver' => $this->whenLoaded('approver', function () {
                return $this->approver ? [
                    'id' => $this->approver->id,
                    'first_name' => $this->approver->first_name,
                    'last_name' => $this->approver->last_name,
                ] : null;
            }),

            'approval_note' => $this->approval_note,
            'approved_at' => $this->approved_at,

            'items' => SalesReturnItemResource::collection(
                $this->whenLoaded('items')
            ),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
