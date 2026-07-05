<?php

namespace App\Repositories\Eloquent;

use App\Models\Profile;
use App\Repositories\Contracts\ProfileRepositoryInterface;
use Illuminate\Support\Collection;

class ProfileRepository implements ProfileRepositoryInterface
{
    public function allForUser(int $userId): Collection
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function find(int $userId, int $profileId): ?Profile
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function create(int $userId, array $attributes): Profile
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function update(int $userId, int $profileId, array $attributes): Profile
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function delete(int $userId, int $profileId): void
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }
}
