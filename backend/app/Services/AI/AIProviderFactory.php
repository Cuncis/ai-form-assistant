<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\AIProviderInterface;
use App\Services\AI\Providers\ClaudeProvider;
use App\Services\AI\Providers\GeminiProvider;
use App\Services\AI\Providers\OpenAIProvider;
use InvalidArgumentException;

class AIProviderFactory
{
    public function make(?string $provider = null): AIProviderInterface
    {
        $provider ??= config('ai.default_provider');
        $settings = config("ai.providers.{$provider}");

        if ($settings === null) {
            throw new InvalidArgumentException("Unknown AI provider [{$provider}]");
        }

        return match ($provider) {
            'claude' => new ClaudeProvider($settings['api_key'], $settings['model']),
            'openai' => new OpenAIProvider($settings['api_key'], $settings['model']),
            'gemini' => new GeminiProvider($settings['api_key'], $settings['model']),
            default => throw new InvalidArgumentException("Unknown AI provider [{$provider}]"),
        };
    }
}
