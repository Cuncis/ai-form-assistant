<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /** System templates (user_id null) available to every account. */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Job Application',
                'system_prompt' => 'You are helping complete a professional job application. Use the candidate profile. Use the company and job information. Answer professionally. Never invent experience. Keep responses concise.',
                'tone' => 'professional',
                'max_words' => 150,
                'writing_style' => null,
            ],
            [
                'name' => 'Upwork Proposal',
                'system_prompt' => 'You are writing an Upwork proposal. Address the client\'s stated need directly in the first sentence. Reference only real, relevant experience from the profile. Avoid generic filler and avoid over-promising.',
                'tone' => 'friendly',
                'max_words' => 200,
                'writing_style' => null,
            ],
            [
                'name' => 'Freelance Proposal',
                'system_prompt' => 'You are writing a freelance project proposal. Summarize understanding of the project, relevant experience, and a clear next step. Keep it concrete and free of buzzwords.',
                'tone' => 'professional',
                'max_words' => 250,
                'writing_style' => null,
            ],
            [
                'name' => 'Cold Email',
                'system_prompt' => 'You are writing a cold outreach email. Open with a specific, relevant observation about the recipient or company. State the value proposition in one sentence. End with a low-friction call to action.',
                'tone' => 'concise',
                'max_words' => 120,
                'writing_style' => null,
            ],
            [
                'name' => 'Grant Application',
                'system_prompt' => 'You are completing a grant application question. Answer formally and precisely, grounded only in the provided profile and project information. Never fabricate metrics or outcomes.',
                'tone' => 'formal',
                'max_words' => 300,
                'writing_style' => null,
            ],
            [
                'name' => 'Vendor Registration',
                'system_prompt' => 'You are completing a vendor/supplier registration form question. Answer factually and concisely based on the provided business profile.',
                'tone' => 'formal',
                'max_words' => 100,
                'writing_style' => null,
            ],
            [
                'name' => 'Questionnaire',
                'system_prompt' => 'You are answering a general questionnaire question. Answer directly and concisely based on the provided profile. If the question cannot be answered from the profile, say so rather than inventing an answer.',
                'tone' => 'concise',
                'max_words' => 100,
                'writing_style' => null,
            ],
        ];

        foreach ($templates as $template) {
            Template::updateOrCreate(
                ['name' => $template['name'], 'is_system' => true],
                $template + ['is_system' => true]
            );
        }
    }
}
