<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\GroqAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    private $aiService;

    public function __construct(GroqAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $today = now()->toDateString();

        $stats = [
            'total_tasks' => $user->tasks()->count(),
            'completed_tasks' => $user->tasks()->where('completed', true)->count(),
            'today_tasks' => $user->tasks()->where('deadline', $today)->count(),
            'overdue_tasks' => $user->tasks()
                ->where('completed', false)
                ->where('deadline', '<', $today)
                ->count(),
            'completion_rate' => $this->calculateCompletionRate($user),
            'suggestions' => $this->aiService->generateSuggestions([])
        ];

        return response()->json($stats);
    }

    public function weekly(Request $request)
    {
        $user = $request->user();
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();

        $weeklyData = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            $weeklyData[] = [
                'date' => $date->toDateString(),
                'day' => $date->locale('ar')->dayName,
                'completed' => $user->tasks()
                    ->where('deadline', $date->toDateString())
                    ->where('completed', true)
                    ->count(),
                'total' => $user->tasks()
                    ->where('deadline', $date->toDateString())
                    ->count()
            ];
        }

        return response()->json($weeklyData);
    }

    public function monthly(Request $request)
    {
        $user = $request->user();
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        $monthlyStats = [
            'total_tasks' => $user->tasks()
                ->whereBetween('deadline', [$startOfMonth, $endOfMonth])
                ->count(),
            'completed_tasks' => $user->tasks()
                ->whereBetween('deadline', [$startOfMonth, $endOfMonth])
                ->where('completed', true)
                ->count(),
            'by_category' => $user->tasks()
                ->whereBetween('deadline', [$startOfMonth, $endOfMonth])
                ->select('category', DB::raw('count(*) as count'))
                ->groupBy('category')
                ->get(),
            'by_priority' => $user->tasks()
                ->whereBetween('deadline', [$startOfMonth, $endOfMonth])
                ->select('priority', DB::raw('count(*) as count'))
                ->groupBy('priority')
                ->get()
        ];

        return response()->json($monthlyStats);
    }

    public function aiSuggestions(Request $request)
    {
        $user = $request->user();
        
        $userData = [
            'total_tasks' => $user->tasks()->count(),
            'completed_rate' => $this->calculateCompletionRate($user),
            'overdue_count' => $user->tasks()
                ->where('completed', false)
                ->where('deadline', '<', now()->toDateString())
                ->count()
        ];

        $suggestions = $this->aiService->generateSuggestions($userData);

        return response()->json($suggestions);
    }

    private function calculateCompletionRate($user): float
    {
        $total = $user->tasks()->count();
        if ($total === 0) return 0;

        $completed = $user->tasks()->where('completed', true)->count();
        return round(($completed / $total) * 100, 2);
    }
}
