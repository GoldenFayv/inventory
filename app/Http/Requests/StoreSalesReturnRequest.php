<?php

namespace App\Http\Requests;

use App\Enum\ProductCondition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSalesReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'reason' => ['nullable', 'string', 'max:1000'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.invoice_item_id' => ['required', 'uuid', 'distinct', Rule::exists("invoice_items", "id")->where('invoice_id', $this->route('invoiceId'))],
            'items.*.quantity' => ['required', 'integer', 'min:1',],
            'items.*.condition' => ['required', Rule::enum(ProductCondition::class),],
            'items.*.reason' => ['nullable', 'string', 'max:1000',],
        ];
    }
}
