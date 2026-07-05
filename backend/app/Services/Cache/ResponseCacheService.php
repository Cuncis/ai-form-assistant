<?php

namespace App\Services\Cache;

use App\DTOs\GenerateResultDTO;

/** Redis-backed cache keyed by hash(question+profile+template+context). */
class ResponseCacheService
{
    public function get(string $key): ?GenerateResultDTO
    {
        throw new \RuntimeException('Not implemented — Phase 5');
    }

    public function put(string $key, GenerateResultDTO $result): void
    {
        throw new \RuntimeException('Not implemented — Phase 5');
    }

    public function makeKey(int $profileId, int $templateId, string $question, string $pageContext): string
    {
        return hash('sha256', "{$profileId}:{$templateId}:{$question}:{$pageContext}");
    }
}
