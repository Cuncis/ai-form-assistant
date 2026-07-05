<?php

namespace App\Repositories\Contracts;

use App\Models\Template;
use Illuminate\Support\Collection;

interface TemplateRepositoryInterface
{
    public function allForUser(int $userId): Collection;

    public function find(int $userId, int $templateId): ?Template;

    public function create(int $userId, array $attributes): Template;

    public function update(int $userId, int $templateId, array $attributes): Template;

    public function delete(int $userId, int $templateId): void;
}
