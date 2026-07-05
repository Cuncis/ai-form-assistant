<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Usage\UsageTracker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsageController extends Controller
{
    public function __construct(private readonly UsageTracker $usageTracker) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }
}
