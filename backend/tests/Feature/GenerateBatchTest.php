<?php

namespace Tests\Feature;

use App\Jobs\LogUsageJob;
use App\Models\Profile;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GenerateBatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_generates_answers_for_each_field_using_claudes_tool_use_response(): void
    {
        config(['ai.providers.claude.api_key' => 'test-key']);
        Queue::fake();

        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [
                    [
                        'type' => 'tool_use',
                        'name' => 'provide_answers',
                        'input' => [
                            'answers' => [
                                [
                                    'fieldId' => 'q1',
                                    'answer' => 'I am excited about this role because of your focus on developer tools.',
                                    'confidence' => 'high',
                                    'assumptions' => [],
                                ],
                                [
                                    'fieldId' => 'q2',
                                    'answer' => 'Yes, I am available to start immediately.',
                                    'confidence' => 'medium',
                                    'assumptions' => ['Assumed immediate availability was being asked about.'],
                                ],
                            ],
                        ],
                    ],
                ],
                'usage' => ['input_tokens' => 500, 'output_tokens' => 120],
            ], 200),
        ]);

        $user = User::factory()->create(['plan' => 'free']);
        Sanctum::actingAs($user, ['*']);

        $profile = new Profile([
            'name' => 'WordPress Developer',
            'slug' => 'wordpress-developer',
            'headline' => 'Senior Full Stack Developer',
            'summary' => 'I build end-to-end web products.',
            'skills' => ['WordPress', 'Laravel'],
            'experience' => [['title' => 'Webmaster', 'organization' => 'SwipeRx', 'summary' => 'WordPress maintenance']],
            'is_default' => true,
        ]);
        $profile->user_id = $user->id;
        $profile->save();

        $template = new Template([
            'name' => 'Job Application',
            'system_prompt' => 'Answer professionally. Never invent experience.',
            'tone' => 'professional',
            'max_words' => 150,
            'is_system' => false,
        ]);
        $template->user_id = $user->id;
        $template->save();

        $response = $this->postJson('/api/v1/generate/batch', [
            'profileId' => $profile->id,
            'templateId' => $template->id,
            'pageContext' => [
                'url' => 'https://boards.greenhouse.io/acme/jobs/123',
                'title' => 'Senior Engineer — Acme',
                'companyName' => 'Acme',
                'visibleText' => 'Acme is hiring a Senior Engineer to join our platform team.',
                'language' => 'en',
            ],
            'fields' => [
                ['fieldId' => 'q1', 'question' => 'Why do you want to work here?', 'fieldKind' => 'textarea'],
                ['fieldId' => 'q2', 'question' => 'Are you available to start immediately?', 'fieldKind' => 'radio', 'options' => ['Yes', 'No']],
            ],
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'data' => [
                ['fieldId' => 'q1', 'confidence' => 'high', 'cached' => false],
                ['fieldId' => 'q2', 'confidence' => 'medium', 'cached' => false],
            ],
        ]);

        $this->assertDatabaseCount('generations', 2);
        $this->assertDatabaseHas('generations', [
            'user_id' => $user->id,
            'question_text' => 'Why do you want to work here?',
            'confidence' => 'high',
        ]);

        Queue::assertPushed(LogUsageJob::class, function (LogUsageJob $job) {
            return $job->promptTokens === 500 && $job->completionTokens === 120 && $job->provider === 'claude';
        });

        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.anthropic.com/v1/messages'
                && $request['tool_choice']['name'] === 'provide_answers'
                && str_contains($request['system'], 'Never invent experience');
        });
    }

    public function test_it_serves_the_second_identical_question_from_cache(): void
    {
        config(['ai.providers.claude.api_key' => 'test-key']);
        Queue::fake();

        Http::fake([
            'api.anthropic.com/*' => Http::sequence()
                ->push([
                    'content' => [[
                        'type' => 'tool_use',
                        'name' => 'provide_answers',
                        'input' => ['answers' => [['fieldId' => 'q1', 'answer' => 'Answer.', 'confidence' => 'high', 'assumptions' => []]]],
                    ]],
                    'usage' => ['input_tokens' => 200, 'output_tokens' => 50],
                ], 200),
        ]);

        $user = User::factory()->create(['plan' => 'free']);
        Sanctum::actingAs($user, ['*']);

        $profile = new Profile(['name' => 'Dev', 'slug' => 'dev', 'headline' => 'h', 'summary' => 's', 'is_default' => true]);
        $profile->user_id = $user->id;
        $profile->save();

        $template = new Template(['name' => 'T', 'system_prompt' => 'p', 'tone' => 'professional', 'max_words' => 100, 'is_system' => false]);
        $template->user_id = $user->id;
        $template->save();

        $payload = [
            'profileId' => $profile->id,
            'templateId' => $template->id,
            'pageContext' => [
                'url' => 'https://boards.greenhouse.io/acme/jobs/123',
                'title' => 'Senior Engineer — Acme',
                'companyName' => 'Acme',
                'visibleText' => 'Acme is hiring.',
                'language' => 'en',
            ],
            'fields' => [
                ['fieldId' => 'q1', 'question' => 'Why do you want to work here?', 'fieldKind' => 'textarea'],
            ],
        ];

        $this->postJson('/api/v1/generate/batch', $payload)->assertOk();
        $second = $this->postJson('/api/v1/generate/batch', $payload);

        $second->assertOk();
        $second->assertJson(['data' => [['fieldId' => 'q1', 'cached' => true]]]);

        // Only the first request should have hit the (faked) Claude API.
        Http::assertSentCount(1);
    }

    public function test_it_can_use_a_system_template_it_does_not_own(): void
    {
        // Regression test: TemplateRepository::find() used to scope strictly to
        // where('user_id', $userId), which meant system templates (user_id null)
        // could never be found here even though every user can see and use them.
        config(['ai.providers.claude.api_key' => 'test-key']);
        Queue::fake();

        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [[
                    'type' => 'tool_use',
                    'name' => 'provide_answers',
                    'input' => ['answers' => [['fieldId' => 'q1', 'answer' => 'Answer.', 'confidence' => 'high', 'assumptions' => []]]],
                ]],
                'usage' => ['input_tokens' => 100, 'output_tokens' => 20],
            ], 200),
        ]);

        $user = User::factory()->create(['plan' => 'free']);
        Sanctum::actingAs($user, ['*']);

        $profile = new Profile(['name' => 'Dev', 'slug' => 'dev', 'headline' => 'h', 'summary' => 's', 'is_default' => true]);
        $profile->user_id = $user->id;
        $profile->save();

        $systemTemplate = new Template(['name' => 'Job Application', 'system_prompt' => 'p', 'tone' => 'professional', 'max_words' => 100, 'is_system' => true]);
        $systemTemplate->save();

        $response = $this->postJson('/api/v1/generate/batch', [
            'profileId' => $profile->id,
            'templateId' => $systemTemplate->id,
            'pageContext' => [
                'url' => 'https://boards.greenhouse.io/acme/jobs/1',
                'title' => 'Engineer',
                'visibleText' => 'hiring',
                'language' => 'en',
            ],
            'fields' => [
                ['fieldId' => 'q1', 'question' => 'Why do you want to work here?', 'fieldKind' => 'textarea'],
            ],
        ]);

        $response->assertOk();
    }

    public function test_it_returns_a_normalized_502_when_the_claude_api_key_is_missing(): void
    {
        config(['ai.providers.claude.api_key' => null]);

        $user = User::factory()->create(['plan' => 'free']);
        Sanctum::actingAs($user, ['*']);

        $profile = new Profile(['name' => 'Dev', 'slug' => 'dev', 'headline' => 'h', 'summary' => 's', 'is_default' => true]);
        $profile->user_id = $user->id;
        $profile->save();

        $template = new Template(['name' => 'T', 'system_prompt' => 'p', 'tone' => 'professional', 'max_words' => 100, 'is_system' => false]);
        $template->user_id = $user->id;
        $template->save();

        $response = $this->postJson('/api/v1/generate/batch', [
            'profileId' => $profile->id,
            'templateId' => $template->id,
            'pageContext' => [
                'url' => 'https://boards.greenhouse.io/acme/jobs/1',
                'title' => 'Engineer',
                'visibleText' => 'hiring',
                'language' => 'en',
            ],
            'fields' => [
                ['fieldId' => 'q1', 'question' => 'Why do you want to work here?', 'fieldKind' => 'textarea'],
            ],
        ]);

        $response->assertStatus(502);
        $response->assertJson(['success' => false, 'error' => 'Claude API key is not configured.', 'code' => '502']);
    }
}
