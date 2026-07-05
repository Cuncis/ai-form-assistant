<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Profile */
class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'headline' => $this->headline,
            'summary' => $this->summary,
            'skills' => $this->skills ?? [],
            'experience' => $this->experience ?? [],
            'isDefault' => $this->is_default ?? false,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
