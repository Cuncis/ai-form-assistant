<?php

namespace App\Services\Cache;

use App\DTOs\GenerateResultDTO;
use Illuminate\Support\Facades\Cache;

/** Redis-backed cache keyed by hash(profile+template+question+context). */
class ResponseCacheService
{
    private const PREFIX = 'ai_generation:';

    public function get(string $key): ?GenerateResultDTO
    {
        $cached = Cache::get(self::PREFIX.$key);

        if ($cached === null) {
            return null;
        }

        return new GenerateResultDTO(
            fieldId: $cached['fieldId'],
            answer: $cached['answer'],
            confidence: $cached['confidence'],
            assumptions: $cached['assumptions'],
            tokensUsed: 0,
            cached: true,
        );
    }

    public function put(string $key, GenerateResultDTO $result): void
    {
        Cache::put(self::PREFIX.$key, [
            'fieldId' => $result->fieldId,
            'answer' => $result->answer,
            'confidence' => $result->confidence,
            'assumptions' => $result->assumptions,
        ], config('ai.cache_ttl_seconds'));
    }

    /** $contextKey should be something stable (e.g. company name or domain) — not the full page text. */
    public function makeKey(int $profileId, int $templateId, string $question, string $contextKey): string
    {
        return hash('sha256', "{$profileId}:{$templateId}:{$question}:{$contextKey}");
    }
}
