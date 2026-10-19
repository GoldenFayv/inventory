<?php

namespace Tests;

use App\Actions\Createstore;
use App\Actions\CreateUser;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Tests\Concerns\InteractsWithSubscriptions;

abstract class TestCase extends BaseTestCase
{
    use InteractsWithSubscriptions;
public function createUser(array $overrides = []): User
{
    return app(CreateUser::class)->handle(User::factory()->raw($overrides));
}

    public function createStore(User $owner): Store
    {
        $store = Store::factory()->make()->toArray();

        return app(Createstore::class)->handle($owner, $store);
    }
}
