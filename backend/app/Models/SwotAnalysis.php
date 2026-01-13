<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SwotAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_text',
        'analysis_result',
        'period_type',
        'accepted'
    ];

    protected $casts = [
        'analysis_result' => 'array',
        'accepted' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
