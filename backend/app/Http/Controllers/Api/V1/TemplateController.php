<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    public function __construct(private readonly TemplateRepositoryInterface $templates) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }

    public function update(Request $request, int $template): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }

    public function destroy(Request $request, int $template): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }
}
