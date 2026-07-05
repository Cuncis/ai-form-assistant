<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\GenerationRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function __construct(private readonly GenerationRepositoryInterface $generations) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }

    public function destroy(Request $request, int $history): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }

    public function export(Request $request): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }
}
