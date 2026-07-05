<?php

namespace App\Services\AI\Providers;

use App\Services\AI\Contracts\AIProviderInterface;

/** Stub — demonstrates the adapter pattern extends cleanly. Not wired until a client asks for it. */
class OpenAIProvider implements AIProviderInterface
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
    ) {}

    public function generate(array $fields, string $systemPrompt, string $pageContext): array
    {
        throw new \RuntimeException('OpenAIProvider not implemented yet');
    }

    public function name(): string
    {
        return 'openai';
    }
}
