<?php

namespace App\Actions\Products;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RestockProduct
{
    public function handle(User $user, array $data)
    {
        $validated = Validator::make($data, [
            "products" => ["required", "array", "min:1"],
            "products.*.quanity" => ["required", "integer", "min:1"],
            "products.*.product_id" => ['required', 'uuid', Rule::exists("products", "id")->where("store_id", $user->active_store_id)]
        ])->validate();
    }
}
