<?php

namespace App\Services\Usage;

class UsageTracker
{
    public function record(int $userId, string $provider, string $model, int $promptTokens, int $completionTokens, string $endpoint): void
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function summaryForUser(int $userId): array
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }
}
