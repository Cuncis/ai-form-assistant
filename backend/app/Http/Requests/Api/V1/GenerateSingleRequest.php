<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

/** Convenience wrapper over the same pipeline as /generate/batch, for a single field. */
class GenerateSingleRequest extends FormRequest
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

            'field.fieldId' => ['required', 'string'],
            'field.question' => ['required', 'string'],
            'field.fieldKind' => ['required', 'string'],
            'field.options' => ['nullable', 'array'],
            'field.options.*' => ['string'],
        ];
    }
}
