<?php

namespace App\Services\AI\Providers;

use App\DTOs\AIGenerationResultDTO;
use App\Services\AI\Contracts\AIProviderInterface;

/** Stub — demonstrates the adapter pattern extends cleanly. Not wired until a client asks for it. */
class GeminiProvider implements AIProviderInterface
{
    public function __construct(
        private readonly ?string $apiKey,
        private readonly string $model,
    ) {}

    public function generate(array $fields, string $systemPrompt): AIGenerationResultDTO
    {
        throw new \RuntimeException('GeminiProvider not implemented yet');
    }

    public function name(): string
    {
        return 'gemini';
    }
}
