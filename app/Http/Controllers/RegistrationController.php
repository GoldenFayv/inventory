<?php

namespace App\Http\Controllers;

use App\Actions\CreateUser;
use App\Actions\Login;
use App\DataTransferObjects\LoginContext;
use App\DataTransferObjects\NewUserContext;
use App\Events\LoginEvent;
use App\Events\NewUserEvent;
use App\Http\Resources\UserResource;
use App\Support\RefreshTokenCookie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    public function __invoke(Request $request, CreateUser $createUser, Login $login): JsonResponse
    {
        $user = $createUser->handle($request->all());

        $login_data = [
            'identifier' => $user->email ?? $user->phone,
            'password' => $request->input('password'),
        ];

        $response = $login->handle($login_data);

        LoginEvent::dispatch($user, LoginContext::fromRequest($request, $response['access_token']));
        NewUserEvent::dispatch($user, new NewUserContext());

        return new UserResource($user)->additional([
            'access_token' => $response['access_token'],
            'expires_in'   => $response['expires_in'],
        ])
            ->response()
            ->setStatusCode(201)
            ->withCookie(RefreshTokenCookie::make($response['refresh_token']));
    }
}
