<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount_paid' => ['required', 'integer', 'min:0'],

            // Needed when a credit sale has an upfront payment.
            'payment_method' => ['nullable', Rule::in(['cash', 'transfer'])],

            'due_date' => [
                'nullable',
                'date',
                'after_or_equal:today',
            ],

            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_address' => ['nullable', 'string', 'max:255'],
            'customer_lga_id' => ['nullable', 'uuid', 'exists:local_govt_areas,id',],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'uuid', 'distinct', Rule::exists("products", "id")->where("store_id", $this->user()->active_store_id)->where('is_active', true),],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
