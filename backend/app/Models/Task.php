<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'priority',
        'deadline',
        'completed',
        'completed_at',
        'category',
        'ai_generated',
        'estimated_time'
    ];

    protected $casts = [
        'completed' => 'boolean',
        'ai_generated' => 'boolean',
        'deadline' => 'datetime:Y-m-d',
        'completed_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
