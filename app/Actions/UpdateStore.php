<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UpdateStore
{
    public function handle(User $user, array $data)
    {
        $store = $user->active_store;

        $validated = Validator::make($data, [
            "name" => [
                "sometimes",
                Rule::unique("stores", "name")
                    ->ignore($store->id)
                    ->where(fn($query) => $query->where("owner_id", $user->getKey()))
            ],
            "address" => ["sometimes"],
            "lga_id" => ["sometimes", Rule::exists("local_govt_areas", "id")],
            "zip_code" => ["sometimes"],
            "email" => ["sometimes", "email", Rule::unique("stores", "email")->ignore($store->id)],
            "phone" => ["sometimes", Rule::unique("stores", "phone")->ignore($store->id)],
        ])->validate();


        $store->update($validated);

        return $store->fresh();
    }
}
