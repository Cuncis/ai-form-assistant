<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'system_prompt', 'tone', 'max_words', 'writing_style', 'is_system'])]
class Template extends Model
{
    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'max_words' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
