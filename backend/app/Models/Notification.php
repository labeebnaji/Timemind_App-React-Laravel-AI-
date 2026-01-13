<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'type',
        'title',
        'message',
        'priority',
        'is_read',
        'read_at',
        'is_urgent'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'is_urgent' => 'boolean',
        'read_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    // Delete read notifications older than 7 days
    public static function cleanOldReadNotifications()
    {
        self::where('is_read', true)
            ->where('read_at', '<', now()->subDays(7))
            ->delete();
    }
}
