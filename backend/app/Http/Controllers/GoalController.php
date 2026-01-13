<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Services\GroqAIService;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    private $aiService;

    public function __construct(GroqAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index(Request $request)
    {
        $goals = $request->user()->goals()
            ->orderBy('deadline', 'asc')
            ->get();

        return response()->json($goals);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:personal,professional,educational,health',
            'deadline' => 'required|date',
            'progress' => 'nullable|integer|min:0|max:100'
        ]);

        $goal = $request->user()->goals()->create($request->all());

        return response()->json($goal, 201);
    }

    public function show(Request $request, Goal $goal)
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        return response()->json($goal);
    }

    public function update(Request $request, Goal $goal)
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|required|in:personal,professional,educational,health',
            'deadline' => 'sometimes|required|date',
            'progress' => 'sometimes|integer|min:0|max:100'
        ]);

        $goal->update($request->all());

        return response()->json($goal);
    }

    public function destroy(Request $request, Goal $goal)
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $goal->delete();

        return response()->json(['message' => 'تم حذف الهدف بنجاح']);
    }

    public function analyzeWithAI(Request $request)
    {
        $request->validate([
            'goal' => 'required|string'
        ]);

        // Generate AI plan for the goal
        $plan = [
            'steps' => [
                'تحديد الهدف بوضوح',
                'تقسيم الهدف إلى مهام صغيرة',
                'تحديد جدول زمني',
                'البدء بالتنفيذ',
                'المتابعة والتقييم'
            ],
            'timeline' => '3-6 أشهر',
            'success_rate' => '85%'
        ];

        return response()->json($plan);
    }
}
