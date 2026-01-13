<?php

namespace App\Http\Controllers;

use App\Models\SwotAnalysis;
use App\Models\Task;
use App\Services\GroqAIService;
use Illuminate\Http\Request;

class SwotController extends Controller
{
    private $aiService;

    public function __construct(GroqAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function analyze(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'period' => 'required|in:daily,weekly,monthly,yearly'
        ]);

        $user = $request->user();
        
        // Call AI service to analyze
        $analysis = $this->aiService->analyzeSWOT(
            $request->text,
            $request->period,
            $user->name
        );

        // Save analysis to database
        $swotAnalysis = SwotAnalysis::create([
            'user_id' => $user->id,
            'original_text' => $request->text,
            'analysis_result' => $analysis,
            'period_type' => $request->period
        ]);

        return response()->json($analysis);
    }

    public function history(Request $request)
    {
        $analyses = $request->user()->swotAnalyses()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($analyses);
    }

    public function acceptPlan(Request $request, $id)
    {
        $analysis = SwotAnalysis::findOrFail($id);

        if ($analysis->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        // Mark as accepted
        $analysis->update(['accepted' => true]);

        // Create tasks from organized_tasks
        $organizedTasks = $analysis->analysis_result['organized_tasks'] ?? [];
        
        foreach ($organizedTasks as $taskData) {
            Task::create([
                'user_id' => $request->user()->id,
                'title' => $taskData['title'],
                'description' => $taskData['description'] ?? '',
                'priority' => $taskData['priority'] ?? 'medium',
                'deadline' => $taskData['deadline'],
                'category' => $taskData['category'] ?? 'personal',
                'estimated_time' => $taskData['estimated_time'] ?? null,
                'ai_generated' => true
            ]);
        }

        return response()->json([
            'message' => 'تم قبول الخطة وحفظ المهام بنجاح',
            'tasks_created' => count($organizedTasks)
        ]);
    }
}
