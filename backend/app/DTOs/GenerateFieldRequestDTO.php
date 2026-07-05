<?php

namespace App\DTOs;

readonly class GenerateFieldRequestDTO
{
    public function __construct(
        public string $fieldId,
        public string $question,
        public string $fieldKind,
        /** @var string[] */
        public array $options = [],
    ) {}
}
