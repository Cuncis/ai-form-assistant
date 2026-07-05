<?php

namespace App\Repositories\Eloquent;

use App\Models\Generation;
use App\Repositories\Contracts\GenerationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GenerationRepository implements GenerationRepositoryInterface
{
    public function paginateForUser(int $userId, int $perPage = 25): LengthAwarePaginator
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function create(int $userId, array $attributes): Generation
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function updateStatus(int $userId, int $generationId, string $status): Generation
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function delete(int $userId, int $generationId): void
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }
}
