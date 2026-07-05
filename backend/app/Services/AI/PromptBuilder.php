<?php

namespace App\Services\AI;

use App\Models\Profile;
use App\Models\Template;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Owns prompt assembly server-side (system prompt + profile + page context) so prompt
 * quality/safety fixes ship without a Chrome Web Store review cycle. See ARCHITECTURE.md §3.2.
 */
class PromptBuilder
{
    private const MAX_VISIBLE_TEXT_CHARS = 4000;

    /** @param  array{url: string, title: string, metaDescription?: ?string, companyName?: ?string, visibleText: string, language: string}  $pageContext */
    public function build(Template $template, Profile $profile, User $user, array $pageContext): string
    {
        $sections = [
            $template->system_prompt,
            $this->styleInstructions($template),
            $this->profileSection($profile, $user),
            $this->pageContextSection($pageContext),
            $this->languageInstructions($pageContext['language'] ?? 'auto'),
            $this->groundingRules(),
        ];

        return implode("\n\n", array_filter($sections));
    }

    private function styleInstructions(Template $template): string
    {
        $line = "Respond in a {$template->tone} tone. Keep the answer under {$template->max_words} words.";

        if (! empty($template->writing_style)) {
            $line .= " Writing style: {$template->writing_style}.";
        }

        return $line;
    }

    private function profileSection(Profile $profile, User $user): string
    {
        $lines = [
            'CANDIDATE PROFILE',
            "Name: {$user->name}",
            "Profile: {$profile->name} — {$profile->headline}",
            "Summary: {$profile->summary}",
        ];

        if (! empty($profile->skills)) {
            $lines[] = 'Skills: '.implode(', ', $profile->skills);
        }

        if (! empty($profile->experience)) {
            $lines[] = 'Experience:';
            foreach ($profile->experience as $entry) {
                $span = trim(($entry['startDate'] ?? '').' – '.($entry['endDate'] ?? 'present'), ' –');
                $lines[] = "- {$entry['title']} at {$entry['organization']}".($span ? " ({$span})" : '').": {$entry['summary']}";
            }
        }

        return implode("\n", $lines);
    }

    /** @param  array{url: string, title: string, metaDescription?: ?string, companyName?: ?string, visibleText: string, language: string}  $pageContext */
    private function pageContextSection(array $pageContext): string
    {
        $lines = [
            'PAGE CONTEXT',
            "URL: {$pageContext['url']}",
            "Title: {$pageContext['title']}",
        ];

        if (! empty($pageContext['companyName'])) {
            $lines[] = "Company: {$pageContext['companyName']}";
        }

        if (! empty($pageContext['metaDescription'])) {
            $lines[] = "Meta description: {$pageContext['metaDescription']}";
        }

        $lines[] = 'Visible page text: '.Str::limit($pageContext['visibleText'] ?? '', self::MAX_VISIBLE_TEXT_CHARS);

        return implode("\n", $lines);
    }

    private function languageInstructions(string $language): string
    {
        return match ($language) {
            'id' => 'Respond in Indonesian.',
            'en' => 'Respond in English.',
            default => 'Respond in the same language as the question and page content.',
        };
    }

    private function groundingRules(): string
    {
        return implode("\n", [
            'RULES',
            '- Never invent experience, credentials, employers, or metrics that are not present in the candidate profile above.',
            '- If the profile does not support a confident answer, still answer as best you can, mark confidence as "low", and note the gap in assumptions.',
            '- Keep every answer concise and directly responsive to its specific question.',
        ]);
    }
}
