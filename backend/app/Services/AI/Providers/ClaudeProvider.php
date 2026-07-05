<?php

namespace App\Services\AI\Providers;

use App\DTOs\AIGenerationResultDTO;
use App\DTOs\GenerateFieldRequestDTO;
use App\DTOs\GenerateResultDTO;
use App\Exceptions\AIProviderException;
use App\Services\AI\Contracts\AIProviderInterface;
use Illuminate\Support\Facades\Http;

class ClaudeProvider implements AIProviderInterface
{
    private const API_URL = 'https://api.anthropic.com/v1/messages';

    private const ANTHROPIC_VERSION = '2023-06-01';

    private const MAX_TOKENS = 4096;

    public function __construct(
        private readonly ?string $apiKey,
        private readonly string $model,
    ) {}

    /** @param  GenerateFieldRequestDTO[]  $fields */
    public function generate(array $fields, string $systemPrompt): AIGenerationResultDTO
    {
        if (empty($this->apiKey)) {
            throw new AIProviderException('Claude API key is not configured.');
        }

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => self::ANTHROPIC_VERSION,
        ])->post(self::API_URL, [
            'model' => $this->model,
            'max_tokens' => self::MAX_TOKENS,
            'system' => $systemPrompt,
            'messages' => [
                ['role' => 'user', 'content' => $this->buildUserMessage($fields)],
            ],
            'tools' => [$this->answerToolSchema()],
            'tool_choice' => ['type' => 'tool', 'name' => 'provide_answers'],
        ]);

        if ($response->failed()) {
            throw new AIProviderException('Claude API request failed: '.$response->json('error.message', $response->body()));
        }

        return $this->parseResponse($response->json(), $fields);
    }

    public function name(): string
    {
        return 'claude';
    }

    /** @param  GenerateFieldRequestDTO[]  $fields */
    private function buildUserMessage(array $fields): string
    {
        $lines = ['Answer each of the following form field questions using the provide_answers tool.', ''];

        foreach ($fields as $index => $field) {
            $n = $index + 1;
            $optionsNote = ! empty($field->options) ? ' (options: '.implode(', ', $field->options).')' : '';
            $lines[] = "{$n}. [fieldId: {$field->fieldId}] ({$field->fieldKind}){$optionsNote} {$field->question}";
        }

        return implode("\n", $lines);
    }

    private function answerToolSchema(): array
    {
        return [
            'name' => 'provide_answers',
            'description' => 'Provide an answer, confidence level, and any assumptions for each form field question.',
            'input_schema' => [
                'type' => 'object',
                'properties' => [
                    'answers' => [
                        'type' => 'array',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'fieldId' => ['type' => 'string'],
                                'answer' => ['type' => 'string'],
                                'confidence' => ['type' => 'string', 'enum' => ['high', 'medium', 'low']],
                                'assumptions' => ['type' => 'array', 'items' => ['type' => 'string']],
                            ],
                            'required' => ['fieldId', 'answer', 'confidence', 'assumptions'],
                        ],
                    ],
                ],
                'required' => ['answers'],
            ],
        ];
    }

    /** @param  GenerateFieldRequestDTO[]  $fields */
    private function parseResponse(array $body, array $fields): AIGenerationResultDTO
    {
        $toolUse = collect($body['content'] ?? [])->firstWhere('type', 'tool_use');

        if (! $toolUse) {
            throw new AIProviderException('Claude response did not include the expected tool call.');
        }

        $answers = collect($toolUse['input']['answers'] ?? [])->keyBy('fieldId');

        $promptTokens = $body['usage']['input_tokens'] ?? 0;
        $completionTokens = $body['usage']['output_tokens'] ?? 0;
        $perFieldTokens = count($fields) > 0 ? intdiv($promptTokens + $completionTokens, count($fields)) : 0;

        $results = collect($fields)->map(function (GenerateFieldRequestDTO $field) use ($answers, $perFieldTokens) {
            $answer = $answers->get($field->fieldId);

            if (! $answer) {
                return new GenerateResultDTO(
                    fieldId: $field->fieldId,
                    answer: '',
                    confidence: 'low',
                    assumptions: ['Claude did not return an answer for this field.'],
                    tokensUsed: 0,
                );
            }

            return new GenerateResultDTO(
                fieldId: $field->fieldId,
                answer: $answer['answer'],
                confidence: $answer['confidence'],
                assumptions: $answer['assumptions'] ?? [],
                tokensUsed: $perFieldTokens,
            );
        })->all();

        return new AIGenerationResultDTO($results, $promptTokens, $completionTokens);
    }
}
