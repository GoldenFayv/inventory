<?php

namespace App\Events;

use App\DataTransferObjects\NewUserContext;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\PrivateChannel;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewUserEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public User $user, public NewUserContext $newUserContext)
    {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("new_user.{$this->user->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new.user';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->user->id,
            'new_user_context' => $this->newUserContext,
        ];
    }
}
