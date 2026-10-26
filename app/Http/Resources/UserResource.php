<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // mydd($request->user()->("1"));
        $isSelf = $request->user()?->is($this->resource) ?? false;

        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'email_verified' => (bool)$this->email_verified_at,
            'phone_verified' => $this->phone_verified,

            'last_login' => $this->when(
                $isSelf && $this->relationLoaded('last_login'),
                fn(): LoginHistoryResource => new LoginHistoryResource($this->last_login),
            ),

            'store_user' => $this->whenLoaded('user_stores', fn(): UserStoreResource => new UserStoreResource($this->user_stores->first())),

            'other_stores' => $this->when(
                $isSelf && $this->relationLoaded('user_stores'),
                fn(): AnonymousResourceCollection => UserStoreResource::collection($this->user_stores),
            )
        ];
    }
}
