<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class ProfileStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'headline' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string'],
            'experience' => ['nullable', 'array'],
            'experience.*.title' => ['required', 'string'],
            'experience.*.organization' => ['required', 'string'],
            'experience.*.summary' => ['required', 'string'],
            'experience.*.startDate' => ['nullable', 'string'],
            'experience.*.endDate' => ['nullable', 'string'],
            'isDefault' => ['nullable', 'boolean'],
        ];
    }
}
