<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_only_the_authenticated_users_own_profiles(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        Profile::factory()->for($user)->count(2)->create();
        Profile::factory()->create(); // another user's profile

        $response = $this->getJson('/api/v1/profiles');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_it_creates_a_profile_and_auto_generates_a_slug(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/v1/profiles', [
            'name' => 'WordPress Developer',
            'headline' => 'Senior Full Stack Developer',
            'summary' => 'I build end-to-end web products.',
            'skills' => ['WordPress', 'Laravel'],
            'experience' => [['title' => 'Webmaster', 'organization' => 'SwipeRx', 'summary' => 'Maintenance']],
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.slug', 'wordpress-developer');
        $response->assertJsonPath('data.isDefault', false);
        $response->assertJsonPath('data.skills', ['WordPress', 'Laravel']);
        $this->assertDatabaseHas('profiles', ['user_id' => $user->id, 'slug' => 'wordpress-developer']);
    }

    public function test_it_rejects_a_profile_missing_required_fields(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/v1/profiles', []);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    public function test_it_updates_only_the_owners_own_profile(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
        $profile = Profile::factory()->for($user)->create(['headline' => 'Old']);

        $response = $this->putJson("/api/v1/profiles/{$profile->id}", ['headline' => 'New']);

        $response->assertOk();
        $response->assertJsonPath('data.headline', 'New');
    }

    public function test_it_404s_updating_a_profile_owned_by_another_user(): void
    {
        $owner = User::factory()->create();
        $profile = Profile::factory()->for($owner)->create();

        $attacker = User::factory()->create();
        Sanctum::actingAs($attacker, ['*']);

        $response = $this->putJson("/api/v1/profiles/{$profile->id}", ['headline' => 'Hijacked']);

        $response->assertStatus(404);
        $this->assertDatabaseMissing('profiles', ['id' => $profile->id, 'headline' => 'Hijacked']);
    }

    public function test_it_404s_deleting_a_profile_owned_by_another_user(): void
    {
        $owner = User::factory()->create();
        $profile = Profile::factory()->for($owner)->create();

        $attacker = User::factory()->create();
        Sanctum::actingAs($attacker, ['*']);

        $response = $this->deleteJson("/api/v1/profiles/{$profile->id}");

        $response->assertStatus(404);
        $this->assertDatabaseHas('profiles', ['id' => $profile->id]);
    }

    public function test_it_deletes_the_owners_own_profile(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
        $profile = Profile::factory()->for($user)->create();

        $response = $this->deleteJson("/api/v1/profiles/{$profile->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('profiles', ['id' => $profile->id]);
    }

    public function test_index_requires_authentication(): void
    {
        $this->getJson('/api/v1/profiles')->assertStatus(401);
    }
}
