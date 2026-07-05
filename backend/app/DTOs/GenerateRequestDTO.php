<?php

namespace App\DTOs;

readonly class GenerateRequestDTO
{
    /**
     * @param  array{url: string, title: string, metaDescription?: ?string, companyName?: ?string, visibleText: string, language: string}  $pageContext
     * @param  GenerateFieldRequestDTO[]  $fields
     */
    public function __construct(
        public int $userId,
        public int $profileId,
        public int $templateId,
        public array $pageContext,
        public array $fields,
    ) {}
}
