<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiSuggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'suggestion_type',
        'content',
        'implemented'
    ];

    protected $casts = [
        'implemented' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
