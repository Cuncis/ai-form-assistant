<?php

namespace App\Repositories\Eloquent;

use App\Models\Generation;
use App\Repositories\Contracts\GenerationRepositoryInterface;
use Illuminate\Support\Collection;

class GenerationRepository implements GenerationRepositoryInterface
{
    public function allForUser(int $userId, int $limit = 100): Collection
    {
        return Generation::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function create(int $userId, array $attributes): Generation
    {
        $generation = new Generation($attributes);
        $generation->user_id = $userId;
        $generation->save();

        return $generation;
    }

    public function updateStatus(int $userId, int $generationId, string $status): Generation
    {
        $generation = Generation::where('user_id', $userId)->findOrFail($generationId);
        $generation->update(['status' => $status]);

        return $generation;
    }

    public function delete(int $userId, int $generationId): void
    {
        Generation::where('user_id', $userId)->findOrFail($generationId)->delete();
    }
}
