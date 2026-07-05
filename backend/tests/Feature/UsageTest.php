<?php

namespace Tests\Feature;

use App\Models\UsageLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UsageTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_reports_zeros_for_a_user_with_no_usage(): void
    {
        $user = User::factory()->create(['plan' => 'free']);
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/v1/usage');

        $response->assertOk();
        $response->assertJsonPath('data.requestCount', 0);
        $response->assertJsonPath('data.tokensUsed', 0);
        $response->assertJsonPath('data.planLimit', 50);
    }

    public function test_it_aggregates_only_the_current_months_usage_for_the_authenticated_user(): void
    {
        $user = User::factory()->create(['plan' => 'free']);
        Sanctum::actingAs($user, ['*']);

        $thisMonthLog = new UsageLog(['provider' => 'claude', 'model' => 'claude-sonnet-4-6', 'prompt_tokens' => 500, 'completion_tokens' => 120, 'cost_usd' => 0, 'endpoint' => 'generate/batch']);
        $thisMonthLog->user_id = $user->id;
        $thisMonthLog->save();

        $lastMonthLog = new UsageLog(['provider' => 'claude', 'model' => 'claude-sonnet-4-6', 'prompt_tokens' => 999, 'completion_tokens' => 999, 'cost_usd' => 0, 'endpoint' => 'generate/batch']);
        $lastMonthLog->user_id = $user->id;
        $lastMonthLog->save();
        $lastMonthLog->created_at = Carbon::now()->subMonthNoOverflow();
        $lastMonthLog->save();

        $otherUsersLog = new UsageLog(['provider' => 'claude', 'model' => 'claude-sonnet-4-6', 'prompt_tokens' => 1, 'completion_tokens' => 1, 'cost_usd' => 0, 'endpoint' => 'generate/batch']);
        $otherUsersLog->user_id = User::factory()->create()->id;
        $otherUsersLog->save();

        $response = $this->getJson('/api/v1/usage');

        $response->assertOk();
        $response->assertJsonPath('data.requestCount', 1);
        $response->assertJsonPath('data.tokensUsed', 620);
    }

    public function test_pro_plan_gets_the_pro_limit(): void
    {
        $user = User::factory()->create(['plan' => 'pro']);
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/v1/usage');

        $response->assertOk();
        $response->assertJsonPath('data.planLimit', 1000);
    }

    public function test_it_requires_authentication(): void
    {
        $this->getJson('/api/v1/usage')->assertStatus(401);
    }
}
