<?php

namespace App\Services\AI;

use App\Models\Profile;
use App\Models\Template;

/**
 * Owns prompt assembly server-side (system prompt + profile + page context) so prompt
 * quality/safety fixes ship without a Chrome Web Store review cycle. See ARCHITECTURE.md §3.2.
 */
class PromptBuilder
{
    public function build(Template $template, Profile $profile, string $pageContext, string $language): string
    {
        throw new \RuntimeException('Not implemented — Phase 5');
    }
}
