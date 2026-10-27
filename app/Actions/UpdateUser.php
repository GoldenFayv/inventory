<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUser
{
    public function handle(User $user, array $data): User
    {
        $validated = Validator::make($data, [
            "first_name" => ['sometimes', 'string'],
            "last_name" => ['sometimes', 'string'],
            "email" => ['sometimes', 'email', Rule::unique("users", "email")->ignore($user->getKey())],
            "phone" => ['sometimes', Rule::unique("users", "phone")->whereNotNull('phone')->ignore($user->getKey())],
            "password" => ['sometimes', Password::min(8)->mixedCase()->numbers()->symbols()],
        ])->validate();

        $user->update($validated);

        return $user->fresh(['user_stores.subscription.plan.features', 'user_stores.store', 'last_login', 'user_stores.roles']);
    }
}
