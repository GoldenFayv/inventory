<?php

namespace App\DataTransferObjects;

use Illuminate\Http\Request;

final readonly class LoginContext
{
    public function __construct(
        public string $token,
        public ?string $user_store_id = null,
        public ?string $ip = null,
        public ?string $user_agent = null,
    ) {}

    public static function fromRequest(Request $request, string $token, ?string $userStoreId = null): self
    {
        return new self(
            user_store_id: $userStoreId,
            ip: $request->ip(),
            user_agent: $request->userAgent(),
            token: $token
        );
    }
}
