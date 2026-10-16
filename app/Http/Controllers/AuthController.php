<?php

namespace App\Http\Controllers;

use App\Actions\Login;
use App\Actions\RequestAccessToken;
use App\DataTransferObjects\LoginContext;
use App\Events\LoginEvent;
use App\Http\Resources\UserResource;
use App\Support\RefreshTokenCookie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(protected Login $login) {}
    public function store(Request $request): JsonResponse
    {
        $response = $this->login->handle($request->all());

        LoginEvent::dispatch($response['user'], LoginContext::fromRequest($request, $response['access_token']));

        return new UserResource($response['user'])->additional([
            'access_token' => $response['access_token'],
            'expires_in'   => $response['expires_in'],
        ])
            ->response()
            ->setStatusCode(201)
            ->withCookie(RefreshTokenCookie::make($response['refresh_token']));
    }

    public function show(Request $request): UserResource
    {
        $user = $request->user();
        return new UserResource($user->load(['user_stores.user', 'last_login']));
    }

    public function destroy(Request $request)
    {
        $token = $request->user()->token();
        $token->refreshToken?->revoke();
        $token->revoke();

        return response()->json(['message' => 'Logged out'])
            ->withCookie(RefreshTokenCookie::forget());
    }

    public function update(Request $request)
    {
        $refresh_token = $request->cookie(RefreshTokenCookie::NAME);

        if (! $refresh_token) {
            throw ValidationException::withMessages([
                "refresh_token" => "No refresh token"
            ]);
        }

        $response = app(RequestAccessToken::class)->handle([
            'grant_type'    => 'refresh_token',
            'refresh_token' => $refresh_token
        ]);

        return new UserResource($response['user'])->additional([
            'access_token' => $response['access_token'],
            'expires_in'   => $response['expires_in'],
        ])
            ->response()
            ->setStatusCode(201)
            ->withCookie(RefreshTokenCookie::make($response['refresh_token']));
    }
}
