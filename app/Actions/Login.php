<?php

namespace App\Actions;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class Login
{
    public function handle(array $payload): array
    {
        $validated = Validator::make($payload, [
            'identifier' => ['required'],
            'password' => ['required', 'min:8', Password::min(8)->mixedCase()->numbers()->symbols()]
        ])->validate();

        $validated['username'] = $validated['identifier'];

        $response = app(RequestAccessToken::class)->handle(['grant_type' => 'password', ...$validated]);

        return $response;
    }
}
