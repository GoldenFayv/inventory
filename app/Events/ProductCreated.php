<?php

namespace App\Events;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public User $user, public Product $product) {}
}
