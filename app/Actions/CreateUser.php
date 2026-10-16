<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class CreateUser
{
    public function handle(array $data): User
    {
        $validated = Validator::make($data, [
            "first_name" => ['required', 'string'],
            "last_name" => ['required', 'string'],
            "email" => ['required', 'email', Rule::unique("users", "email")],
            "phone" => ['sometimes', Rule::unique("users", "phone")],
            "password" => ['required', Password::min(8)->mixedCase()->numbers()->symbols()]
        ])->validate();

        return User::create($validated);
    }
}
