<?php

namespace App\Listeners;

use App\Events\LoginEvent;
use App\Models\LoginHistory;
use App\Models\User;
use App\Models\UserStore;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class RecordLoginHistory implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(LoginEvent $event): void
    {
        if ($event->loginContext->user_store_id) {
            LoginHistory::create([
                'reference_id' => $event->loginContext->user_store_id,
                'reference_type' => (new UserStore())->getMorphClass(),
                'ip' => $event->loginContext->ip,
                'user_agent' => $event->loginContext->user_agent,
                'logged_in_at' => now(),
            ]);
        }

        LoginHistory::create([
            'reference_id' => $event->user->getKey(),
            'reference_type' => $event->user->getMorphClass(),
            'ip_address' => $event->loginContext->ip,
            'user_agent' => $event->loginContext->user_agent,
            "token" => $event->loginContext->token,
            'logged_in_at'  => now(),
        ]);

        logger("DONE");
    }
}
