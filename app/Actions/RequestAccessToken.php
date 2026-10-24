<?php

namespace App\Actions;

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Passport\Passport;

class RequestAccessToken
{
    public function handle(array $validated)
    {
        $tokenRequest = Request::create('/oauth/token', 'POST',  [
            'grant_type'  => $validated['grant_type'],
            'client_id' => config('passport.client_id'),
            'client_secret' => config('passport.client_secret'),
            'scope' => '',
            ...$validated,
        ]);

        $tokenRequest->headers->set('Accept', 'application/json');

        $response = app()->handle($tokenRequest);

        $data = json_decode($response->getContent(), true);

        if ($response->getStatusCode() === 400 && $validated['grant_type'] === "password") {
            throw ValidationException::withMessages([
                "identifier" => "Incorrect credentials!"
            ]);
        }

        if (!$response->isSuccessful()) {
            throw new \RuntimeException('Token request failed: ' . ($data['message'] ?? $response->getStatusCode()));
        }

        $token_id = $this->tokenId($data['access_token']);

        $data['user'] = Passport::token()->newQuery()->find($token_id)?->user;

        return $data;
    }

    private function tokenId(string $jwt): ?string
    {
        $payload = explode('.', $jwt)[1] ?? '';

        return json_decode(base64_decode(strtr($payload, '-_', '+/')), true)['jti'] ?? null;
    }
}
