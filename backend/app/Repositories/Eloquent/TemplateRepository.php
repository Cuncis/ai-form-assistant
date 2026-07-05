<?php

namespace App\Repositories\Eloquent;

use App\Models\Template;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use Illuminate\Support\Collection;

class TemplateRepository implements TemplateRepositoryInterface
{
    /** Own templates plus every system template, system ones first. */
    public function allForUser(int $userId): Collection
    {
        return Template::where('user_id', $userId)
            ->orWhere('is_system', true)
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get();
    }

    /** Readable if owned by the user or a system template — matches allForUser()'s visibility. */
    public function find(int $userId, int $templateId): ?Template
    {
        return Template::where(fn ($query) => $query->where('user_id', $userId)->orWhere('is_system', true))
            ->find($templateId);
    }

    public function create(int $userId, array $attributes): Template
    {
        $template = new Template($attributes);
        $template->user_id = $userId;
        $template->is_system = false;
        $template->save();

        return $template;
    }

    public function update(int $userId, int $templateId, array $attributes): Template
    {
        $template = Template::where('user_id', $userId)->findOrFail($templateId);
        $template->update($attributes);

        return $template;
    }

    public function delete(int $userId, int $templateId): void
    {
        Template::where('user_id', $userId)->findOrFail($templateId)->delete();
    }
}
