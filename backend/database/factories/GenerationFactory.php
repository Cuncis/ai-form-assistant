<?php

namespace Database\Factories;

use App\Models\Generation;
use App\Models\Profile;
use App\Models\Template;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Generation>
 */
class GenerationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'profile_id' => Profile::factory(),
            'template_id' => Template::factory(),
            'provider' => 'claude',
            'model' => 'claude-sonnet-4-6',
            'site_domain' => 'boards.greenhouse.io',
            'page_url' => 'https://boards.greenhouse.io/acme/jobs/1',
            'question_text' => fake()->sentence().'?',
            'answer_text' => fake()->paragraph(),
            'confidence' => fake()->randomElement(['high', 'medium', 'low']),
            'tokens_used' => fake()->numberBetween(50, 500),
            'cached' => false,
            'status' => 'pending',
        ];
    }
}
