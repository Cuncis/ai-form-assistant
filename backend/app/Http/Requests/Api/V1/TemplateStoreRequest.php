<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TemplateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'systemPrompt' => ['required', 'string'],
            'tone' => ['required', Rule::in(['professional', 'friendly', 'formal', 'concise', 'enthusiastic'])],
            'maxWords' => ['required', 'integer', 'min:20', 'max:1000'],
            'writingStyle' => ['nullable', 'string', 'max:255'],
        ];
    }
}
