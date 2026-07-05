<?php

namespace App\DTOs;

readonly class GenerateResultDTO
{
    public function __construct(
        public string $fieldId,
        public string $answer,
        /** @var 'high'|'medium'|'low' */
        public string $confidence,
        /** @var string[] */
        public array $assumptions,
        public int $tokensUsed,
        public bool $cached = false,
    ) {}
}
