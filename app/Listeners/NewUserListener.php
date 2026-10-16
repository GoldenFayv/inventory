<?php

namespace App\Listeners;

use App\Actions\AssignRoleToUser;
use App\Actions\CreateUserStore;
use App\Events\NewUserEvent;
use App\Models\Store;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;

class NewUserListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct(public CreateUserStore $createUserStore, public AssignRoleToUser $assignRoleToUser)
    {
        //
    }

    public int $tries = 3;
    public bool $afterCommit = true; // don't run before the user row is committed

    public function handle(NewUserEvent $event): void
    {
        $context = $event->newUserContext;

        if (! $context->store_id) {
            return;
        }

        DB::transaction(function () use ($event, $context) {
            $user = $event->user;
            $store = Store::findOrFail($context->store_id);

            $this->createUserStore->handle($user, $store);

            if ($context->role_id) {
                $this->assignRoleToUser->handle($store->id, ['role_id' => $context->role_id], $user->id);
            }

            if (! $user->active_store_id) {
                $user->updateQuietly(['active_store_id' => $store->id]);
            }
        });
    }

    public function failed(NewUserEvent $event, \Throwable $e): void
    {
        report($e); // or notify, so a half-onboarded user doesn't go unnoticed
    }
}
