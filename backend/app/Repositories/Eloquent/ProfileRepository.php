<?php

namespace App\Repositories\Eloquent;

use App\Models\Profile;
use App\Repositories\Contracts\ProfileRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProfileRepository implements ProfileRepositoryInterface
{
    public function allForUser(int $userId): Collection
    {
        return Profile::where('user_id', $userId)->orderBy('name')->get();
    }

    public function find(int $userId, int $profileId): ?Profile
    {
        return Profile::where('user_id', $userId)->find($profileId);
    }

    public function create(int $userId, array $attributes): Profile
    {
        $attributes['slug'] ??= Str::slug($attributes['name']);
        $attributes['is_default'] ??= false;
        $attributes['skills'] ??= [];
        $attributes['experience'] ??= [];

        $profile = new Profile($attributes);
        $profile->user_id = $userId;
        $profile->save();

        return $profile;
    }

    public function update(int $userId, int $profileId, array $attributes): Profile
    {
        $profile = Profile::where('user_id', $userId)->findOrFail($profileId);
        $profile->update($attributes);

        return $profile;
    }

    public function delete(int $userId, int $profileId): void
    {
        Profile::where('user_id', $userId)->findOrFail($profileId)->delete();
    }
}
