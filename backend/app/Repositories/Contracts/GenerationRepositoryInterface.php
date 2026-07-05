<?php

namespace App\Repositories\Contracts;

use App\Models\Generation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface GenerationRepositoryInterface
{
    public function paginateForUser(int $userId, int $perPage = 25): LengthAwarePaginator;

    public function create(int $userId, array $attributes): Generation;

    public function updateStatus(int $userId, int $generationId, string $status): Generation;

    public function delete(int $userId, int $generationId): void;
}
