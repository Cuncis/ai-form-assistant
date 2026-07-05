<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\GenerateController;
use App\Http\Controllers\Api\V1\HistoryController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\TemplateController;
use App\Http\Controllers\Api\V1\UsageController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);

        Route::apiResource('profiles', ProfileController::class)->except(['show']);
        Route::apiResource('templates', TemplateController::class)->except(['show']);

        Route::post('generate', [GenerateController::class, 'single']);
        Route::post('generate/batch', [GenerateController::class, 'batch']);

        Route::get('history', [HistoryController::class, 'index']);
        Route::delete('history/{history}', [HistoryController::class, 'destroy']);
        Route::get('history/export', [HistoryController::class, 'export']);

        Route::get('usage', [UsageController::class, 'show']);

        Route::get('settings', [SettingsController::class, 'show']);
        Route::put('settings', [SettingsController::class, 'update']);
    });
});
