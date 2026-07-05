<?php

namespace App\Providers;

use App\Repositories\Contracts\GenerationRepositoryInterface;
use App\Repositories\Contracts\ProfileRepositoryInterface;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use App\Repositories\Eloquent\GenerationRepository;
use App\Repositories\Eloquent\ProfileRepository;
use App\Repositories\Eloquent\TemplateRepository;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ProfileRepositoryInterface::class, ProfileRepository::class);
        $this->app->bind(TemplateRepositoryInterface::class, TemplateRepository::class);
        $this->app->bind(GenerationRepositoryInterface::class, GenerationRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Authenticated requests are limited per user (tiered by plan); unauthenticated
        // requests (register/login) are limited per IP to deter brute forcing.
        RateLimiter::for('api', function ($request) {
            $user = $request->user();

            if (! $user) {
                return Limit::perMinute(10)->by($request->ip());
            }

            $perMinute = match ($user->plan) {
                'pro' => 120,
                default => 30,
            };

            return Limit::perMinute($perMinute)->by($user->id);
        });
    }
}
