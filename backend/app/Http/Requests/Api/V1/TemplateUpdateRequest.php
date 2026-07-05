<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TemplateUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'systemPrompt' => ['sometimes', 'string'],
            'tone' => ['sometimes', Rule::in(['professional', 'friendly', 'formal', 'concise', 'enthusiastic'])],
            'maxWords' => ['sometimes', 'integer', 'min:20', 'max:1000'],
            'writingStyle' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
