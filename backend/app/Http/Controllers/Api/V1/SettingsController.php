<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }

    public function update(Request $request): JsonResponse
    {
        return response()->json(['success' => false, 'error' => 'Not implemented — Phase 4'], 501);
    }
}
