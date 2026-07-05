<?php

namespace Database\Factories;

use App\Models\Template;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Template>
 */
class TemplateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true),
            'system_prompt' => fake()->paragraph(),
            'tone' => fake()->randomElement(['professional', 'friendly', 'formal', 'concise', 'enthusiastic']),
            'max_words' => fake()->numberBetween(50, 300),
            'writing_style' => null,
            'is_system' => false,
        ];
    }

    public function system(): static
    {
        return $this->state(fn () => ['user_id' => null, 'is_system' => true]);
    }
}
