<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class Createstore
{
    public function handle(User $user, array $data)
    {
        $validated = Validator::make($data, [
            "name" => ["required"],
            "address" => ["required"],
            "lga_id" => ["required", Rule::exists("local_govt_areas", "id")],
            "zip_code" => ["sometimes"]
        ])->validate();

        return $user->store()->create($validated);
    }
}
