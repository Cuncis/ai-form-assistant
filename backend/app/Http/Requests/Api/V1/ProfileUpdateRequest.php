<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255'],
            'headline' => ['sometimes', 'string', 'max:255'],
            'summary' => ['sometimes', 'string'],
            'skills' => ['sometimes', 'array'],
            'skills.*' => ['string'],
            'experience' => ['sometimes', 'array'],
            'experience.*.title' => ['required_with:experience', 'string'],
            'experience.*.organization' => ['required_with:experience', 'string'],
            'experience.*.summary' => ['required_with:experience', 'string'],
            'experience.*.startDate' => ['nullable', 'string'],
            'experience.*.endDate' => ['nullable', 'string'],
            'isDefault' => ['sometimes', 'boolean'],
        ];
    }
}
