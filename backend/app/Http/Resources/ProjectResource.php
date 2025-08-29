<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'geo_json' => $this->geo_json,
            'region_id' => $this->region_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'region' => new RegionResource($this->whenLoaded('region')),
            'pins' => PinResource::collection($this->whenLoaded('pins')),
        ];
    }
}
