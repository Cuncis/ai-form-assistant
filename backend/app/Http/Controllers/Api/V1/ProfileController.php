<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\ProfileRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly ProfileRepositoryInterface $profiles) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }

    public function update(Request $request, int $profile): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }

    public function destroy(Request $request, int $profile): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }
}
