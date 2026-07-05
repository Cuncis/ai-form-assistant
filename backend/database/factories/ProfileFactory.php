<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->jobTitle();

        return [
            'user_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'headline' => fake()->catchPhrase(),
            'summary' => fake()->paragraph(),
            'skills' => fake()->words(4),
            'experience' => [],
            'is_default' => false,
        ];
    }
}
