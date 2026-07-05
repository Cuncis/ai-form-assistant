<?php

namespace App\Services\AI\Providers;

use App\Services\AI\Contracts\AIProviderInterface;

class ClaudeProvider implements AIProviderInterface
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
    ) {}

    public function generate(array $fields, string $systemPrompt, string $pageContext): array
    {
        // Real Anthropic Messages API call (tool-use / structured output for confidence
        // scoring, per ARCHITECTURE.md §3.3) lands in Phase 5.
        throw new \RuntimeException('Not implemented — Phase 5');
    }

    public function name(): string
    {
        return 'claude';
    }
}
