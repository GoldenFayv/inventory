<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserStoreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "user" => $this->whenLoaded("user", fn(): UserResource => new UserResource($this->user)),
            "store" => $this->whenLoaded("store", fn(): StoreResource => new StoreResource($this->store)),
            "last_login" => $this->whenLoaded("last_login", fn(): LoginHistoryResource => new LoginHistoryResource($this->last_login))
        ];
    }
}
