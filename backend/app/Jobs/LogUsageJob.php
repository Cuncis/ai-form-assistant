<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/** Keeps the generate/batch response path fast — usage bookkeeping happens off the request. */
class LogUsageJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $userId,
        public readonly string $provider,
        public readonly string $model,
        public readonly int $promptTokens,
        public readonly int $completionTokens,
        public readonly string $endpoint,
    ) {}

    public function handle(): void
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }
}
