<?php

namespace Tests\Feature;

use App\Models\Generation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_only_the_users_own_generations_newest_first(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $older = Generation::factory()->for($user)->create(['created_at' => now()->subDay()]);
        $newer = Generation::factory()->for($user)->create(['created_at' => now()]);
        Generation::factory()->create(); // another user's

        $response = $this->getJson('/api/v1/history');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertEquals([(string) $newer->id, (string) $older->id], $ids->all());
    }

    public function test_generation_resource_uses_camel_case_keys(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
        Generation::factory()->for($user)->create([
            'question_text' => 'Why do you want to work here?',
            'site_domain' => 'boards.greenhouse.io',
        ]);

        $response = $this->getJson('/api/v1/history');

        $response->assertOk();
        $response->assertJsonPath('data.0.questionText', 'Why do you want to work here?');
        $response->assertJsonPath('data.0.siteDomain', 'boards.greenhouse.io');
    }

    public function test_it_404s_deleting_another_users_history_entry(): void
    {
        $owner = User::factory()->create();
        $generation = Generation::factory()->for($owner)->create();

        $attacker = User::factory()->create();
        Sanctum::actingAs($attacker, ['*']);

        $this->deleteJson("/api/v1/history/{$generation->id}")->assertStatus(404);
        $this->assertDatabaseHas('generations', ['id' => $generation->id]);
    }

    public function test_it_deletes_the_owners_own_history_entry(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
        $generation = Generation::factory()->for($user)->create();

        $response = $this->deleteJson("/api/v1/history/{$generation->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('generations', ['id' => $generation->id]);
    }

    public function test_export_returns_all_of_the_users_history(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
        Generation::factory()->for($user)->count(3)->create();

        $response = $this->getJson('/api/v1/history/export');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }
}
