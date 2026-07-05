<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class GenerateBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'profileId' => ['required', 'integer'],
            'templateId' => ['required', 'integer'],

            'pageContext' => ['required', 'array'],
            'pageContext.url' => ['required', 'string'],
            'pageContext.title' => ['required', 'string'],
            'pageContext.metaDescription' => ['nullable', 'string'],
            'pageContext.companyName' => ['nullable', 'string'],
            'pageContext.visibleText' => ['required', 'string'],
            'pageContext.language' => ['required', 'string'],

            'fields' => ['required', 'array', 'min:1'],
            'fields.*.fieldId' => ['required', 'string'],
            'fields.*.question' => ['required', 'string'],
            'fields.*.fieldKind' => ['required', 'string'],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.options.*' => ['string'],
        ];
    }
}
