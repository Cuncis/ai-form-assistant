<?php

return [
    'default_provider' => env('AI_DEFAULT_PROVIDER', 'claude'),

    'providers' => [
        'claude' => [
            'api_key' => env('ANTHROPIC_API_KEY'),
            'model' => env('ANTHROPIC_MODEL', 'claude-sonnet-4-6'),
        ],
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'model' => env('OPENAI_MODEL', 'gpt-5'),
        ],
        'gemini' => [
            'api_key' => env('GEMINI_API_KEY'),
            'model' => env('GEMINI_MODEL', 'gemini-3-pro'),
        ],
    ],

    'cache_ttl_seconds' => env('AI_CACHE_TTL_SECONDS', 3600),
];
