<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id', 'profile_id', 'template_id', 'provider', 'model', 'site_domain', 'page_url',
    'question_text', 'answer_text', 'confidence', 'tokens_used', 'cached', 'status',
])]
class Generation extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'cached' => 'boolean',
            'tokens_used' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }
}
