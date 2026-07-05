<?php

namespace App\Services\AI\Contracts;

use App\DTOs\AIGenerationResultDTO;
use App\DTOs\GenerateFieldRequestDTO;

/**
 * One implementation per vendor (Claude, OpenAI, Gemini). Adding a vendor later means
 * implementing this interface and registering it in AIProviderFactory — nothing else
 * in the request pipeline changes.
 */
interface AIProviderInterface
{
    /**
     * $systemPrompt already has page context folded in by PromptBuilder — the provider
     * only needs the questions to answer and where to answer them from.
     *
     * @param  GenerateFieldRequestDTO[]  $fields
     */
    public function generate(array $fields, string $systemPrompt): AIGenerationResultDTO;

    public function name(): string;
}
