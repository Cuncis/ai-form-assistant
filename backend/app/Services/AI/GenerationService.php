<?php

namespace App\Services\AI;

use App\DTOs\GenerateRequestDTO;
use App\DTOs\GenerateResultDTO;
use App\Services\Cache\ResponseCacheService;
use App\Services\Usage\UsageTracker;

/** Orchestrates: cache lookup -> prompt build -> provider call -> usage log -> history row. */
class GenerationService
{
    public function __construct(
        private readonly AIProviderFactory $providerFactory,
        private readonly PromptBuilder $promptBuilder,
        private readonly ResponseCacheService $cache,
        private readonly UsageTracker $usageTracker,
    ) {}

    /** @return GenerateResultDTO[] */
    public function generateBatch(GenerateRequestDTO $request): array
    {
        throw new \RuntimeException('Not implemented — Phase 5');
    }
}
