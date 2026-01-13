<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Task;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Get unread notifications (for dropdown)
    public function unread(Request $request)
    {
        $notifications = $request->user()->notifications()
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'count' => $notifications->count(),
            'has_urgent' => $notifications->where('is_urgent', true)->count() > 0
        ]);
    }

    // Get all notifications (for notifications page)
    public function index(Request $request)
    {
        // Clean old read notifications
        Notification::cleanOldReadNotifications();

        $notifications = $request->user()->notifications()
            ->orderBy('is_read', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    // Mark as read
    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return response()->json($notification);
    }

    // Mark all as read
    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);

        return response()->json(['message' => 'تم تحديد جميع الإشعارات كمقروءة']);
    }

    // Generate task reminders
    public function generateReminders(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();
        $dayAfterTomorrow = now()->addDays(2)->toDateString();

        $tasks = $user->tasks()->where('completed', false)->get();

        foreach ($tasks as $task) {
            $taskDate = date('Y-m-d', strtotime($task->deadline));

            // Same day reminder
            if ($taskDate === $today) {
                $this->createReminderIfNotExists($user->id, $task, 'task_due_today', 
                    'مهمة تنتهي اليوم! ⚠️',
                    "المهمة \"{$task->title}\" تنتهي اليوم!",
                    true
                );
            }

            // Tomorrow reminder (all tasks + high priority gets extra reminder)
            if ($taskDate === $tomorrow) {
                $this->createReminderIfNotExists($user->id, $task, 'task_due_tomorrow',
                    'تذكير: مهمة تنتهي غداً',
                    "المهمة \"{$task->title}\" تنتهي غداً"
                );
            }

            // High priority: 1 day before (extra reminder)
            if ($task->priority === 'high' && $taskDate === $tomorrow) {
                $this->createReminderIfNotExists($user->id, $task, 'task_high_tomorrow',
                    '⚠️ مهمة عالية الأهمية غداً!',
                    "تذكير: المهمة العالية الأهمية \"{$task->title}\" تنتهي غداً!"
                );
            }

            // High priority: 2 days before
            if ($task->priority === 'high' && $taskDate === $dayAfterTomorrow) {
                $this->createReminderIfNotExists($user->id, $task, 'task_reminder_2days',
                    'تذكير: مهمة عالية الأهمية',
                    "المهمة \"{$task->title}\" تنتهي بعد يومين"
                );
            }
        }

        return response()->json(['message' => 'تم تحديث التذكيرات']);
    }

    private function createReminderIfNotExists($userId, $task, $type, $title, $message, $isUrgent = false)
    {
        $today = now()->toDateString();
        
        $exists = Notification::where('user_id', $userId)
            ->where('task_id', $task->id)
            ->where('type', $type)
            ->whereDate('created_at', $today)
            ->exists();

        if (!$exists) {
            Notification::create([
                'user_id' => $userId,
                'task_id' => $task->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'priority' => $task->priority,
                'is_urgent' => $isUrgent
            ]);
        }
    }

    // Create welcome notification
    public static function createWelcomeNotification($userId)
    {
        Notification::create([
            'user_id' => $userId,
            'type' => 'welcome',
            'title' => 'مرحباً بك في TimeMind AI! 🎉',
            'message' => 'نحن سعداء بانضمامك إلينا. ابدأ بإضافة مهامك الأولى واستمتع بتجربة إدارة الوقت الذكية!',
            'priority' => 'low',
            'is_read' => false
        ]);
    }

    // Create task created notification (auto-read)
    public static function createTaskNotification($userId, $task)
    {
        Notification::create([
            'user_id' => $userId,
            'task_id' => $task->id,
            'type' => 'task_created',
            'title' => 'تم إنشاء مهمة جديدة ✅',
            'message' => "تم إنشاء المهمة \"{$task->title}\" بنجاح",
            'priority' => $task->priority,
            'is_read' => true,
            'read_at' => now()
        ]);
    }
}
