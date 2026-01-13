<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqAIService
{
    private $apiKey;
    private $apiUrl;
    private $model;

    public function __construct()
    {
        $this->apiKey = env('GROQ_API_KEY');
        $this->apiUrl = env('GROQ_API_URL', 'https://api.groq.com/openai/v1/chat/completions');
        $this->model = env('GROQ_MODEL', 'llama-3.3-70b-versatile');
    }

    public function analyzeSWOT(string $userInput, string $period, string $userName): array
    {
        \Log::info('=== GROQ AI START ===', [
            'user' => $userName,
            'input' => substr($userInput, 0, 100),
            'api_key_exists' => !empty($this->apiKey)
        ]);
        
        $prompt = $this->buildSWOTPrompt($userInput, $period, $userName);
        
        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->apiUrl, [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'أنت مستشار محترف في إدارة الوقت. حلل المهام بدقة وأرجع JSON فقط بدون markdown أو أي نص إضافي. يجب أن يكون التحليل مبني على المهام الفعلية المذكورة وليس عام. لا تضع ```json في البداية أو النهاية.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.2,
                'max_tokens' => 2500
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['choices'][0]['message']['content'] ?? '';
                
                \Log::info('✅ AI Response', [
                    'length' => strlen($content),
                    'preview' => substr($content, 0, 200)
                ]);
                
                // Clean content aggressively
                $content = trim($content);
                $content = str_replace('```json', '', $content);
                $content = str_replace('```', '', $content);
                $content = trim($content);
                
                // Try direct decode
                $result = json_decode($content, true);
                
                if (json_last_error() === JSON_ERROR_NONE && isset($result['swot']) && isset($result['organized_tasks'])) {
                    \Log::info('✅ AI SUCCESS - Real Analysis!', [
                        'tasks_count' => count($result['organized_tasks']),
                        'strengths_count' => count($result['swot']['strengths'])
                    ]);
                    return $result;
                }
                
                // Extract JSON with better regex
                if (preg_match('/\{[\s\S]*"swot"[\s\S]*\}/s', $content, $matches)) {
                    $result = json_decode($matches[0], true);
                    if (json_last_error() === JSON_ERROR_NONE && isset($result['swot'])) {
                        \Log::info('✅ AI SUCCESS (extracted)!');
                        return $result;
                    }
                }
                
                \Log::error('⚠️ AI parse failed', [
                    'error' => json_last_error_msg(),
                    'content_sample' => substr($content, 0, 500)
                ]);
                return $this->createFallbackAnalysis($userInput);
            }
            
            \Log::error('❌ AI HTTP Failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return $this->createFallbackAnalysis($userInput);
            
        } catch (\Exception $e) {
            \Log::error('❌ AI Exception', [
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ]);
            return $this->createFallbackAnalysis($userInput);
        }
    }

    private function buildSWOTPrompt(string $userInput, string $period, string $userName): string
    {
        $today = date('Y-m-d');
        $tomorrow = date('Y-m-d', strtotime('+1 day'));
        $nextWeek = date('Y-m-d', strtotime('+7 days'));
        
        return <<<PROMPT
أنت مستشار محترف في إدارة الوقت والإنتاجية. قم بتحليل النص العربي التالي وإرجاع JSON فقط.

المدخلات:
- المستخدم: {$userName}
- الفترة: {$period}
- التاريخ الحالي: {$today}
- النص: "{$userInput}"

المطلوب منك:
1. استخرج كل المهام المذكورة في النص
2. حلل نقاط القوة والضعف والفرص والتهديدات بناءً على المهام الفعلية
3. رتب المهام حسب الأولوية
4. اقترح جدول زمني واقعي

أرجع JSON بهذا الشكل بالضبط:
{
  "swot": {
    "strengths": [
      "نقطة قوة محددة مستخرجة من تحليل المهام الفعلية",
      "نقطة قوة أخرى تعكس سلوك المستخدم",
      "نقطة قوة ثالثة بناءً على نوع المهام"
    ],
    "weaknesses": [
      "نقطة ضعف واضحة من المهام المذكورة",
      "تحدي حقيقي يواجه المستخدم"
    ],
    "opportunities": [
      "فرصة تحسين مبنية على المهام",
      "إمكانية تطوير واقعية",
      "فرصة لزيادة الكفاءة"
    ],
    "threats": [
      "تهديد محتمل من تحليل المهام",
      "خطر على الإنتاجية"
    ]
  },
  "organized_tasks": [
    {
      "title": "عنوان المهمة المستخرج من النص",
      "description": "وصف تفصيلي للمهمة",
      "priority": "high",
      "deadline": "{$tomorrow}",
      "category": "study",
      "estimated_time": "2 ساعة"
    }
  ],
  "schedule": [
    {
      "time": "09:00 - 11:00",
      "task": "اسم المهمة من القائمة"
    }
  ]
}

قواعد صارمة:
- استخرج كل مهمة مذكورة في النص (امتحان، واجب، اجتماع، إلخ)
- نقاط SWOT يجب أن تكون مبنية على المهام الفعلية وليست عامة
- priority: "high" أو "medium" أو "low"
- category: "work" أو "study" أو "personal" أو "health" أو "other"
- deadline: تاريخ بصيغة YYYY-MM-DD بين {$today} و {$nextWeek}
- estimated_time: رقم + "ساعة" أو "دقيقة"
- كل النصوص بالعربية الفصحى
- أرجع JSON فقط بدون أي نص إضافي أو markdown

مثال للتحليل الصحيح:
إذا كان النص: "عندي امتحان رياضيات يوم الخميس واجتماع مع المشرف"
يجب أن تستخرج:
- مهمة 1: الاستعداد لامتحان الرياضيات
- مهمة 2: الاجتماع مع المشرف
- نقاط القوة: "لديك التزام بالمواعيد النهائية", "تخطط مسبقاً للامتحانات"
- نقاط الضعف: "قد تحتاج وقت أطول للدراسة", "ضغط من تعدد المهام"
PROMPT;
    }

    private function createFallbackAnalysis(string $userInput): array
    {
        \Log::warning('⚠️ Using FALLBACK - AI did not work!');
        
        // Parse tasks from user input
        $tasks = $this->parseTasksFromText($userInput);
        
        // Generate dynamic SWOT based on actual input
        $swot = $this->generateDynamicSWOT($userInput, $tasks);
        
        return [
            'swot' => $swot,
            'organized_tasks' => $tasks,
            'schedule' => $this->generateSchedule($tasks),
            'is_fallback' => true,
            'note' => '⚠️ تم إنشاء هذا التحليل محلياً - قد تكون هناك مشكلة في الاتصال بالذكاء الاصطناعي'
        ];
    }
    
    private function generateDynamicSWOT(string $userInput, array $tasks): array
    {
        $taskCount = count($tasks);
        $input = mb_strtolower($userInput);
        
        // Detect task types
        $hasExam = preg_match('/(امتحان|اختبار|تست)/u', $input);
        $hasStudy = preg_match('/(دراسة|مذاكرة|جامعة|كلية)/u', $input);
        $hasWork = preg_match('/(عمل|اجتماع|مشروع|وظيفة)/u', $input);
        $hasHealth = preg_match('/(طبيب|رياضة|صحة|دواء)/u', $input);
        $hasDeadline = preg_match('/(يوم|غداً|الخميس|الأحد|الاثنين)/u', $input);
        
        $strengths = [];
        $weaknesses = [];
        $opportunities = [];
        $threats = [];
        
        // Dynamic strengths
        if ($taskCount > 0) {
            $strengths[] = "لديك وعي واضح بمهامك ({$taskCount} مهمة محددة)";
        }
        if ($hasExam) {
            $strengths[] = "تخطط مسبقاً للامتحانات والاختبارات";
        }
        if ($hasStudy) {
            $strengths[] = "ملتزم بالتعليم والتطوير الذاتي";
        }
        if ($hasWork) {
            $strengths[] = "مسؤول تجاه التزاماتك المهنية";
        }
        if ($hasHealth) {
            $strengths[] = "تهتم بصحتك الجسدية والنفسية";
        }
        if ($hasDeadline) {
            $strengths[] = "تحدد مواعيد نهائية واضحة لمهامك";
        }
        
        // Dynamic weaknesses
        if ($taskCount > 5) {
            $weaknesses[] = "قد تكون محمّل بمهام كثيرة ({$taskCount} مهمة)";
        }
        if ($hasExam && $hasWork) {
            $weaknesses[] = "ضغط من تعدد المسؤوليات (دراسة + عمل)";
        }
        if (!$hasDeadline) {
            $weaknesses[] = "بعض المهام غير محددة بوقت واضح";
        }
        if ($taskCount <= 1) {
            $weaknesses[] = "قد تحتاج لتفصيل المهام بشكل أوضح";
        }
        
        // Dynamic opportunities
        if ($hasStudy && $hasWork) {
            $opportunities[] = "يمكن ربط التعلم بالعمل لتحقيق فائدة مضاعفة";
        }
        if ($taskCount > 3) {
            $opportunities[] = "استخدام تقنيات إدارة الوقت لزيادة الإنتاجية";
        }
        $opportunities[] = "تطبيق مبدأ الأولويات (مهم وعاجل)";
        $opportunities[] = "تقسيم المهام الكبيرة لمهام صغيرة قابلة للإنجاز";
        
        // Dynamic threats
        if ($taskCount > 4) {
            $threats[] = "خطر الإرهاق من كثرة المهام";
        }
        if ($hasExam) {
            $threats[] = "قلق الامتحانات قد يؤثر على التركيز";
        }
        $threats[] = "التأجيل والمماطلة";
        if (!$hasDeadline) {
            $threats[] = "عدم وضوح الأولويات قد يؤدي لتراكم المهام";
        }
        
        return [
            'strengths' => $strengths ?: ['تسعى لتنظيم وقتك بشكل أفضل'],
            'weaknesses' => $weaknesses ?: ['تحتاج لتحديد أولويات أوضح'],
            'opportunities' => array_slice($opportunities, 0, 3),
            'threats' => array_slice($threats, 0, 2)
        ];
    }

    private function parseTasksFromText(string $text): array
    {
        $tasks = [];
        $keywords = [
            'امتحان' => ['category' => 'study', 'priority' => 'high'],
            'دراسة' => ['category' => 'study', 'priority' => 'high'],
            'واجب' => ['category' => 'study', 'priority' => 'medium'],
            'جامعة' => ['category' => 'study', 'priority' => 'medium'],
            'مشروع' => ['category' => 'work', 'priority' => 'high'],
            'اجتماع' => ['category' => 'work', 'priority' => 'high'],
            'طبيب' => ['category' => 'health', 'priority' => 'high'],
            'دواء' => ['category' => 'health', 'priority' => 'high'],
            'رياضة' => ['category' => 'health', 'priority' => 'medium'],
            'صالة' => ['category' => 'health', 'priority' => 'medium'],
        ];

        foreach ($keywords as $keyword => $config) {
            if (stripos($text, $keyword) !== false) {
                $tasks[] = [
                    'title' => 'مهمة: ' . $keyword,
                    'description' => 'تم استخراجها من النص المدخل',
                    'priority' => $config['priority'],
                    'deadline' => date('Y-m-d', strtotime('+' . rand(1, 7) . ' days')),
                    'category' => $config['category'],
                    'estimated_time' => rand(1, 3) . ' ساعة'
                ];
            }
        }

        if (empty($tasks)) {
            $tasks[] = [
                'title' => 'مراجعة المهام المدخلة',
                'description' => $text,
                'priority' => 'medium',
                'deadline' => date('Y-m-d', strtotime('+1 day')),
                'category' => 'personal',
                'estimated_time' => '1 ساعة'
            ];
        }

        return $tasks;
    }

    private function generateSchedule(array $tasks): array
    {
        $schedule = [];
        $startHour = 8;

        foreach ($tasks as $index => $task) {
            $schedule[] = [
                'time' => sprintf('%02d:00 - %02d:00', $startHour, $startHour + 2),
                'task' => $task['title']
            ];
            $startHour += 2;
            
            if ($startHour >= 18) break;
        }

        return $schedule;
    }

    public function generateSuggestions(array $userData): array
    {
        // Generate AI suggestions based on user data
        return [
            [
                'type' => 'productivity',
                'content' => 'أنت أكثر إنتاجية في الصباح، حاول جدولة المهام الصعبة بين 8-11 صباحاً'
            ],
            [
                'type' => 'time_saving',
                'content' => 'تجميع المهام المتشابهة يمكن أن يوفر 3 ساعات أسبوعياً'
            ],
            [
                'type' => 'warning',
                'content' => 'لديك مهام متأخرة، يُنصح بإعادة جدولتها'
            ]
        ];
    }
}
