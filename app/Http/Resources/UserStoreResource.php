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
            "store_id" => $this->store_id,
            "is_active" => $this->is_active,
            "is_owner" => $this->is_owner,
            "new_subscriber" => !(bool) $this->store->subscription,
            "user" => $this->whenLoaded("user", fn(): UserResource => new UserResource($this->user)),
            "store" => $this->whenLoaded("store", fn(): StoreResource => new StoreResource($this->store)),
            "last_login" => $this->whenLoaded("last_login", fn(): LoginHistoryResource => new LoginHistoryResource($this->last_login)),
            "subscription" => $this->whenLoaded("subscription", fn() => new SubscriptionResource($this->subscription)),
            "role" => $this->whenLoaded('roles', function () {
                $role = $this->roles->first();

                return $role ? new RoleResource($role) : null;
            }),
            "permissions" => $this->whenLoaded("roles", fn() => PermissionResource::collection($request->user()->user_store->getAllPermissions()))
        ];
    }
}
