<?php

namespace App\Repositories\Eloquent;

use App\Models\Template;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use Illuminate\Support\Collection;

class TemplateRepository implements TemplateRepositoryInterface
{
    public function allForUser(int $userId): Collection
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function find(int $userId, int $templateId): ?Template
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function create(int $userId, array $attributes): Template
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function update(int $userId, int $templateId, array $attributes): Template
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }

    public function delete(int $userId, int $templateId): void
    {
        throw new \RuntimeException('Not implemented — Phase 4');
    }
}
