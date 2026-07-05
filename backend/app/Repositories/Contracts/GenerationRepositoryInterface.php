<?php

namespace App\Repositories\Contracts;

use App\Models\Generation;
use Illuminate\Support\Collection;

interface GenerationRepositoryInterface
{
    /**
     * Simplified from the Phase 1 sketch's paginated interface: the extension's History/Logs
     * views currently fetch a flat list, not paged. Revisit if history volume makes a real
     * paginated endpoint necessary.
     */
    public function allForUser(int $userId, int $limit = 100): Collection;

    public function create(int $userId, array $attributes): Generation;

    public function updateStatus(int $userId, int $generationId, string $status): Generation;

    public function delete(int $userId, int $generationId): void;
}
