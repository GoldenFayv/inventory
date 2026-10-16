<?php

namespace App\DataTransferObjects;

class NewUserContext
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public ?string $store_id = null,
        public ?string $role_id = null,
    ) {}
}
