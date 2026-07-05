<?php

namespace App\Repositories\Contracts;

use App\Models\Profile;
use Illuminate\Support\Collection;

interface ProfileRepositoryInterface
{
    public function allForUser(int $userId): Collection;

    public function find(int $userId, int $profileId): ?Profile;

    public function create(int $userId, array $attributes): Profile;

    public function update(int $userId, int $profileId, array $attributes): Profile;

    public function delete(int $userId, int $profileId): void;
}
