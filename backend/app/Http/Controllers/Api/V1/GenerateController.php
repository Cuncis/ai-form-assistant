<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\GenerateFieldRequestDTO;
use App\DTOs\GenerateRequestDTO;
use App\DTOs\GenerateResultDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\GenerateBatchRequest;
use App\Http\Requests\Api\V1\GenerateSingleRequest;
use App\Services\AI\GenerationService;
use Illuminate\Http\JsonResponse;

class GenerateController extends Controller
{
    public function __construct(private readonly GenerationService $generationService) {}

    public function single(GenerateSingleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $field = $data['field'];

        $results = $this->generationService->generateBatch(new GenerateRequestDTO(
            userId: $request->user()->id,
            profileId: $data['profileId'],
            templateId: $data['templateId'],
            pageContext: $data['pageContext'],
            fields: [new GenerateFieldRequestDTO(
                fieldId: $field['fieldId'],
                question: $field['question'],
                fieldKind: $field['fieldKind'],
                options: $field['options'] ?? [],
            )],
        ));

        return response()->json(['success' => true, 'data' => $this->toArray($results[0])]);
    }

    public function batch(GenerateBatchRequest $request): JsonResponse
    {
        $data = $request->validated();

        $fields = array_map(fn (array $field) => new GenerateFieldRequestDTO(
            fieldId: $field['fieldId'],
            question: $field['question'],
            fieldKind: $field['fieldKind'],
            options: $field['options'] ?? [],
        ), $data['fields']);

        $results = $this->generationService->generateBatch(new GenerateRequestDTO(
            userId: $request->user()->id,
            profileId: $data['profileId'],
            templateId: $data['templateId'],
            pageContext: $data['pageContext'],
            fields: $fields,
        ));

        return response()->json(['success' => true, 'data' => array_map($this->toArray(...), $results)]);
    }

    private function toArray(GenerateResultDTO $result): array
    {
        return [
            'fieldId' => $result->fieldId,
            'answer' => $result->answer,
            'confidence' => $result->confidence,
            'assumptions' => $result->assumptions,
            'cached' => $result->cached,
        ];
    }
}
