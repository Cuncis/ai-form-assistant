<?php

namespace App\Services\AI\Contracts;

use App\DTOs\GenerateFieldRequestDTO;
use App\DTOs\GenerateResultDTO;

/**
 * One implementation per vendor (Claude, OpenAI, Gemini). Adding a vendor later means
 * implementing this interface and registering it in AIProviderFactory — nothing else
 * in the request pipeline changes.
 */
interface AIProviderInterface
{
    /**
     * @param  GenerateFieldRequestDTO[]  $fields
     * @return GenerateResultDTO[]
     */
    public function generate(array $fields, string $systemPrompt, string $pageContext): array;

    public function name(): string;
}
