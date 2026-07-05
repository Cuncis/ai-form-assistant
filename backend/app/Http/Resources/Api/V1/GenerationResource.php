<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Generation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Generation */
class GenerationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'siteDomain' => $this->site_domain,
            'pageUrl' => $this->page_url,
            'questionText' => $this->question_text,
            'answerText' => $this->answer_text,
            'confidence' => $this->confidence,
            'profileId' => $this->profile_id !== null ? (string) $this->profile_id : null,
            'templateId' => $this->template_id !== null ? (string) $this->template_id : null,
            'status' => $this->status,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
