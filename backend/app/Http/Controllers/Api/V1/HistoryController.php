<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\GenerationResource;
use App\Repositories\Contracts\GenerationRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function __construct(private readonly GenerationRepositoryInterface $generations) {}

    public function index(Request $request): JsonResponse
    {
        $generations = $this->generations->allForUser($request->user()->id);

        return response()->json(['success' => true, 'data' => GenerationResource::collection($generations)]);
    }

    public function destroy(Request $request, int $history): JsonResponse
    {
        $this->generations->delete($request->user()->id, $history);

        return response()->json(['success' => true, 'data' => null]);
    }

    public function export(Request $request): JsonResponse
    {
        $generations = $this->generations->allForUser($request->user()->id, PHP_INT_MAX);

        return response()->json(['success' => true, 'data' => GenerationResource::collection($generations)]);
    }
}
