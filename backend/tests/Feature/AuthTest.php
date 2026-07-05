<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_registers_a_new_user_and_issues_a_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Karang',
            'email' => 'karang@example.com',
            'password' => 'password123',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.user.email', 'karang@example.com');
        $response->assertJsonPath('data.user.plan', 'free');
        $this->assertNotEmpty($response->json('data.token'));

        $this->assertDatabaseHas('users', ['email' => 'karang@example.com']);
    }

    public function test_it_rejects_registration_with_a_duplicate_email(): void
    {
        User::factory()->create(['email' => 'karang@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Karang',
            'email' => 'karang@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    public function test_it_logs_in_with_correct_credentials(): void
    {
        User::factory()->create([
            'email' => 'karang@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'karang@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_it_rejects_login_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'karang@example.com']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'karang@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
        $response->assertJson(['success' => false, 'error' => 'Invalid credentials']);
    }

    public function test_it_rejects_login_for_a_nonexistent_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    public function test_me_returns_the_authenticated_user(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->getJson('/api/v1/me', ['Authorization' => "Bearer {$token}"]);

        $response->assertOk();
        $response->assertJsonPath('data.email', $user->email);
    }

    public function test_me_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/me');

        $response->assertStatus(401);
        $response->assertJson(['success' => false, 'error' => 'Unauthenticated']);
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $authHeader = ['Authorization' => "Bearer {$token}"];

        $this->postJson('/api/v1/auth/logout', [], $authHeader)->assertOk();

        // Assert the token row is actually gone rather than re-authenticating with it in the
        // same test: Sanctum's guard caches the resolved user for the life of the test process,
        // so a second simulated request here would pass even with a real revocation bug — only
        // a real second HTTP request (a fresh process) would genuinely re-check the token.
        $this->assertSame(0, $user->fresh()->tokens()->count());
    }
}
