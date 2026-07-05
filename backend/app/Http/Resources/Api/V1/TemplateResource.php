<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Template */
class TemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'systemPrompt' => $this->system_prompt,
            'tone' => $this->tone,
            'maxWords' => $this->max_words,
            'writingStyle' => $this->writing_style,
            'isSystem' => $this->is_system,
        ];
    }
}
