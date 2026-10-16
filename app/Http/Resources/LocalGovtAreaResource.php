<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocalGovtAreaResource extends JsonResource
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
            "name" => $this->name,
            "state" => $this->whenLoaded("state", new StateResource($this->state)),
            "wards" => $this->whenLoaded("wards", new WardResource($this->wards)),
        ];
    }
}
