<?php

namespace App\DTOs;

readonly class AIGenerationResultDTO
{
    /** @param  GenerateResultDTO[]  $results */
    public function __construct(
        public array $results,
        public int $promptTokens,
        public int $completionTokens,
    ) {}
}
