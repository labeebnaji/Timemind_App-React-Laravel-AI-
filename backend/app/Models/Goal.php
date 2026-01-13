<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'deadline',
        'progress',
        'ai_plan'
    ];

    protected $casts = [
        'deadline' => 'date',
        'progress' => 'integer',
        'ai_plan' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
