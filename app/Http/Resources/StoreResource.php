<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
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
            "address" => $this->address,
            "lga" => $this->whenLoaded("local_govt_area", new LocalGovtAreaResource($this->local_govt_area), null),
            "zip_code" => $this->zip_code,
        ];
    }
}
