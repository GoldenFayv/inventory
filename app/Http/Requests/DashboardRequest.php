<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class DashboardRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization belongs to your store middleware.
    }

    public function rules(): array
    {
        return [
            'date' => ['nullable', 'date_format:Y-m-d'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if (
                    $this->filled('date') &&
                    ($this->filled('from') || $this->filled('to'))
                ) {
                    $validator->errors()->add(
                        'date',
                        'Use either date or from/to, not both.'
                    );
                }

                if ($this->filled('from') xor $this->filled('to')) {
                    $validator->errors()->add(
                        'from',
                        'Provide both from and to for a date range.'
                    );
                }
            },
        ];
    }
}
