<?php

namespace App\Support;

use Symfony\Component\HttpFoundation\Cookie;

final class RefreshTokenCookie
{
    public const string NAME = 'refresh_token';
    private const string PATH = '/api/v1/auth';

    public static function make(string $token): Cookie
    {
        return Cookie::create(
            name: self::NAME,
            value: $token,
            expire: now()->addDays(30)->getTimestamp(), // match refreshTokensExpireIn()
            path: self::PATH,
            domain: null,
            secure: app()->isProduction(),
            httpOnly: true,
            raw: false,
            sameSite: Cookie::SAMESITE_STRICT,
        );
    }

    public static function forget(): Cookie
    {
        return Cookie::create(
            name: self::NAME,
            value: '',
            expire: 1,
            path: self::PATH,
            secure: app()->isProduction(),
            httpOnly: true,
            sameSite: Cookie::SAMESITE_STRICT,
        );
    }
}
