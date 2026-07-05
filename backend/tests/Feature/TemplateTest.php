<?php

namespace Tests\Feature;

use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TemplateTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_own_templates_plus_every_system_template(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        Template::factory()->for($user)->create(['name' => 'My Custom Template']);
        Template::factory()->system()->create(['name' => 'Job Application']);
        Template::factory()->create(['name' => 'Someone Elses Template']); // another user's, not system

        $response = $this->getJson('/api/v1/templates');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('My Custom Template'));
        $this->assertTrue($names->contains('Job Application'));
        $this->assertFalse($names->contains('Someone Elses Template'));
    }

    public function test_it_creates_a_custom_template_owned_by_the_user(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/v1/templates', [
            'name' => 'Agency Proposal',
            'systemPrompt' => 'Write a concise agency proposal.',
            'tone' => 'professional',
            'maxWords' => 250,
            'writingStyle' => 'direct',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.name', 'Agency Proposal');
        $response->assertJsonPath('data.isSystem', false);
        $this->assertDatabaseHas('templates', ['user_id' => $user->id, 'name' => 'Agency Proposal', 'is_system' => false]);
    }

    public function test_it_rejects_an_invalid_tone(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/v1/templates', [
            'name' => 'Bad Template',
            'systemPrompt' => 'x',
            'tone' => 'not-a-real-tone',
            'maxWords' => 100,
        ]);

        $response->assertStatus(422);
    }

    public function test_a_user_cannot_update_a_system_template(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
        $system = Template::factory()->system()->create();

        $response = $this->putJson("/api/v1/templates/{$system->id}", ['name' => 'Hijacked']);

        // System templates have no owner, so the owner-scoped lookup can't find them — 404,
        // not 403, matching the same not-found-not-forbidden pattern as cross-tenant profiles.
        $response->assertStatus(404);
        $this->assertDatabaseHas('templates', ['id' => $system->id, 'name' => $system->name]);
    }

    public function test_it_404s_updating_another_users_template(): void
    {
        $owner = User::factory()->create();
        $template = Template::factory()->for($owner)->create();

        $attacker = User::factory()->create();
        Sanctum::actingAs($attacker, ['*']);

        $this->putJson("/api/v1/templates/{$template->id}", ['name' => 'Hijacked'])->assertStatus(404);
    }

    public function test_it_deletes_the_owners_own_template(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
        $template = Template::factory()->for($user)->create();

        $response = $this->deleteJson("/api/v1/templates/{$template->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('templates', ['id' => $template->id]);
    }
}
