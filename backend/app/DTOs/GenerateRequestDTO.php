<?php

namespace App\DTOs;

readonly class GenerateRequestDTO
{
    public function __construct(
        public int $userId,
        public int $profileId,
        public int $templateId,
        public string $pageUrl,
        public string $pageContext,
        /** @var GenerateFieldRequestDTO[] */
        public array $fields,
        public string $language = 'auto',
    ) {}
}
