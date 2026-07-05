<?php

namespace App\Services\Usage;

use App\Models\UsageLog;
use App\Models\User;
use Illuminate\Support\Carbon;

class UsageTracker
{
    public function record(int $userId, string $provider, string $model, int $promptTokens, int $completionTokens, string $endpoint): void
    {
        $log = new UsageLog([
            'provider' => $provider,
            'model' => $model,
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            // Real per-model $/token pricing is wired alongside the provider integration (Phase 5).
            'cost_usd' => 0,
            'endpoint' => $endpoint,
        ]);
        $log->user_id = $userId;
        $log->save();
    }

    public function summaryForUser(int $userId): array
    {
        $periodStart = Carbon::now()->startOfMonth();
        $periodEnd = Carbon::now()->endOfMonth();

        $logs = UsageLog::where('user_id', $userId)
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->get();

        $plan = User::findOrFail($userId)->plan;

        return [
            'periodStart' => $periodStart->toIso8601String(),
            'periodEnd' => $periodEnd->toIso8601String(),
            'requestCount' => $logs->count(),
            'tokensUsed' => $logs->sum(fn (UsageLog $log) => $log->prompt_tokens + $log->completion_tokens),
            'planLimit' => config("plans.limits.{$plan}", config('plans.limits.free')),
        ];
    }
}
