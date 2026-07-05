<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\TemplateStoreRequest;
use App\Http\Requests\Api\V1\TemplateUpdateRequest;
use App\Http\Resources\Api\V1\TemplateResource;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    private const CAMEL_TO_COLUMN = [
        'systemPrompt' => 'system_prompt',
        'maxWords' => 'max_words',
        'writingStyle' => 'writing_style',
    ];

    public function __construct(private readonly TemplateRepositoryInterface $templates) {}

    public function index(Request $request): JsonResponse
    {
        $templates = $this->templates->allForUser($request->user()->id);

        return response()->json(['success' => true, 'data' => TemplateResource::collection($templates)]);
    }

    public function store(TemplateStoreRequest $request): JsonResponse
    {
        $template = $this->templates->create($request->user()->id, $this->toColumns($request->validated()));

        return response()->json(['success' => true, 'data' => new TemplateResource($template)], 201);
    }

    public function update(TemplateUpdateRequest $request, int $template): JsonResponse
    {
        $updated = $this->templates->update($request->user()->id, $template, $this->toColumns($request->validated()));

        return response()->json(['success' => true, 'data' => new TemplateResource($updated)]);
    }

    public function destroy(Request $request, int $template): JsonResponse
    {
        $this->templates->delete($request->user()->id, $template);

        return response()->json(['success' => true, 'data' => null]);
    }

    /** Maps the camelCase request payload onto the templates table's snake_case columns. */
    private function toColumns(array $validated): array
    {
        $mapped = [];
        foreach ($validated as $key => $value) {
            $mapped[self::CAMEL_TO_COLUMN[$key] ?? $key] = $value;
        }

        return $mapped;
    }
}
