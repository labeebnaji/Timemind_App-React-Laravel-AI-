<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GroqAIService;

class ChatController extends Controller
{
    protected $aiService;

    public function __construct(GroqAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function chat(Request $request)
    {
        $message = $request->input('message', '');
        $toolType = $request->input('tool_type');
        $tasks = $request->input('tasks', []);
        $today = now()->format('Y-m-d');
        $dayName = $this->getArabicDayName(now()->dayOfWeek);

        // Handle tool-based requests
        if ($toolType) {
            return $this->handleTool($toolType, $tasks, $today, $dayName, $message);
        }

        // Regular chat
        return $this->handleChat($message, $today, $dayName);
    }

    private function handleTool($toolType, $tasks, $today, $dayName, $message = '')
    {
        switch ($toolType) {
            case 'evaluate':
                return $this->evaluateUser($tasks, $today, $dayName);
            case 'summary':
                return $this->summarizeTasks($tasks, $today, $dayName);
            case 'organize':
                return $this->organizeTasks($tasks, $today, $dayName);
            case 'organize_task':
                return $this->organizeUserTask($message, $today, $dayName);
            case 'motivate':
                return $this->motivateUser($tasks, $today, $dayName);
            default:
                return response()->json(['response' => 'أداة غير معروفة']);
        }
    }

    private function handleChat($message, $today, $dayName)
    {
        $prompt = <<<PROMPT
أنت TimeMind AI، مساعد ذكي متخصص في إدارة المهام والوقت.

التاريخ الحالي: {$today} ({$dayName})

قواعد الرد:
1. رد باللغة العربية فقط
2. كن مختصراً ومفيداً
3. استخدم الإيموجي بشكل معتدل
4. ركز على إدارة المهام والإنتاجية
5. لا تكرر التحية في كل رد

رسالة المستخدم: {$message}

رد بشكل طبيعي ومفيد:
PROMPT;

        $response = $this->aiService->generateResponse($prompt);
        return response()->json(['response' => $response]);
    }

    private function evaluateUser($tasks, $today, $dayName)
    {
        $tasksJson = json_encode($tasks, JSON_UNESCAPED_UNICODE);
        $completedCount = collect($tasks)->where('completed', true)->count();
        $totalCount = count($tasks);
        $completionRate = $totalCount > 0 ? round(($completedCount / $totalCount) * 100) : 0;

        $prompt = <<<PROMPT
أنت TimeMind AI. قم بتقييم أداء المستخدم بناءً على مهامه.

التاريخ الحالي: {$today} ({$dayName})

بيانات المهام:
{$tasksJson}

إحصائيات سريعة:
- إجمالي المهام: {$totalCount}
- المكتملة: {$completedCount}
- نسبة الإنجاز: {$completionRate}%

=== تعليمات صارمة للرد ===
يجب أن يكون ردك بالضبط بهذا الشكل:

📊 **التقييم العام**
[درجة من 10] / 10

📈 **نسبة الإنجاز**
{$completionRate}%

⚡ **نقاط القوة**
• [نقطة 1]
• [نقطة 2]

⚠️ **نقاط التحسين**
• [نقطة 1]
• [نقطة 2]

🏆 **التصنيف**
[ممتاز/جيد جداً/جيد/مقبول/يحتاج تحسين]

=== قواعد ===
- لا تضف نصائح
- لا تضف كلام إضافي
- التزم بالشكل المحدد فقط
- كن صادقاً ومباشراً
PROMPT;

        $response = $this->aiService->generateResponse($prompt);
        return response()->json(['response' => $response]);
    }

    private function summarizeTasks($tasks, $today, $dayName)
    {
        $tasksJson = json_encode($tasks, JSON_UNESCAPED_UNICODE);
        $completed = collect($tasks)->where('completed', true);
        $incomplete = collect($tasks)->where('completed', false);
        $urgent = collect($tasks)->where('completed', false)->where('priority', 'high');
        $overdue = collect($tasks)->where('completed', false)->filter(function($task) use ($today) {
            return $task['deadline'] < $today;
        });

        $stats = [
            'total' => count($tasks),
            'completed' => $completed->count(),
            'incomplete' => $incomplete->count(),
            'urgent' => $urgent->count(),
            'overdue' => $overdue->count(),
            'rate' => count($tasks) > 0 ? round(($completed->count() / count($tasks)) * 100) : 0
        ];

        $prompt = <<<PROMPT
أنت TimeMind AI. قدم ملخصاً شاملاً لمهام المستخدم.

التاريخ الحالي: {$today} ({$dayName})

بيانات المهام:
{$tasksJson}

الإحصائيات:
- إجمالي: {$stats['total']}
- مكتملة: {$stats['completed']}
- غير مكتملة: {$stats['incomplete']}
- عاجلة: {$stats['urgent']}
- متأخرة: {$stats['overdue']}
- نسبة الإنجاز: {$stats['rate']}%

=== تعليمات صارمة للرد ===
يجب أن يكون ردك بالضبط بهذا الشكل:

📋 **ملخص المهام**

✅ **المكتملة** ({$stats['completed']})
[قائمة مختصرة أو "لا يوجد"]

⏳ **قيد التنفيذ** ({$stats['incomplete']})
[قائمة مختصرة أو "لا يوجد"]

🔴 **العاجلة** ({$stats['urgent']})
[قائمة أو "لا يوجد"]

⚠️ **المتأخرة** ({$stats['overdue']})
[قائمة أو "لا يوجد"]

📊 **نسبة الإنجاز**
{$stats['rate']}%

💡 **الخلاصة**
[جملة واحدة تلخص الوضع]

=== قواعد ===
- التزم بالشكل المحدد
- لا تضف نصائح
- كن مختصراً
PROMPT;

        $response = $this->aiService->generateResponse($prompt);
        return response()->json(['response' => $response]);
    }

    private function organizeTasks($tasks, $today, $dayName)
    {
        $prompt = <<<PROMPT
أنت TimeMind AI. المستخدم يريد إنشاء مهمة جديدة.

التاريخ الحالي: {$today} ({$dayName})

=== تعليمات ===
اطلب من المستخدم وصف مهمته بشكل عشوائي، ثم ستقوم بترتيبها.

رد بهذا النص فقط:

📝 **أداة ترتيب المهمة**

اكتب وصفاً عشوائياً لمهمتك وسأقوم بترتيبها لك:
- اسم مناسب للمهمة
- وصف واضح
- تاريخ انتهاء مقترح
- التصنيف المناسب
- الأولوية

اكتب وصف مهمتك الآن...
PROMPT;

        $response = $this->aiService->generateResponse($prompt);
        return response()->json(['response' => $response]);
    }

    private function organizeUserTask($taskDescription, $today, $dayName)
    {
        $tomorrow = date('Y-m-d', strtotime('+1 day'));
        $nextWeek = date('Y-m-d', strtotime('+7 days'));

        $prompt = <<<PROMPT
أنت TimeMind AI. المستخدم أعطاك وصفاً عشوائياً لمهمة ويريدك أن ترتبها.

التاريخ الحالي: {$today} ({$dayName})

وصف المهمة من المستخدم:
"{$taskDescription}"

=== تعليمات صارمة للرد ===
حلل الوصف وأعطِ المستخدم مهمة مرتبة بالضبط بهذا الشكل:

✨ **المهمة المرتبة**

📌 **اسم المهمة**
[اسم واضح ومختصر للمهمة]

📝 **الوصف**
[وصف تفصيلي واضح للمهمة]

📅 **تاريخ الانتهاء المقترح**
[تاريخ بصيغة YYYY-MM-DD بين {$tomorrow} و {$nextWeek}]

📂 **التصنيف**
[عمل / دراسة / شخصي / صحة / أخرى]

⚡ **الأولوية**
[عالية / متوسطة / منخفضة]

💡 **سبب الاختيارات**
[جملة واحدة تشرح لماذا اخترت هذا التصنيف والأولوية]

=== قواعد ===
- استنتج التصنيف من محتوى الوصف
- حدد الأولوية بناءً على طبيعة المهمة
- اقترح تاريخ انتهاء واقعي
- التزم بالشكل المحدد بالضبط
- لا تضف أي شيء إضافي
PROMPT;

        $response = $this->aiService->generateResponse($prompt);
        return response()->json(['response' => $response]);
    }

    private function motivateUser($tasks, $today, $dayName)
    {
        $tasksJson = json_encode($tasks, JSON_UNESCAPED_UNICODE);
        $completed = collect($tasks)->where('completed', true)->count();
        $total = count($tasks);
        $incomplete = collect($tasks)->where('completed', false);
        $urgentTasks = $incomplete->where('priority', 'high')->values();

        $prompt = <<<PROMPT
أنت TimeMind AI. قدم تحفيزاً مخصصاً للمستخدم بناءً على مهامه.

التاريخ الحالي: {$today} ({$dayName})

بيانات المهام:
{$tasksJson}

إحصائيات:
- مكتملة: {$completed} من {$total}
- مهام عاجلة متبقية: {$urgentTasks->count()}

=== تعليمات صارمة للرد ===
يجب أن يكون ردك بالضبط بهذا الشكل:

🔥 **تحفيز مخصص لك**

💪 **إنجازك حتى الآن**
[جملة إيجابية عن ما أنجزه]

🎯 **التحدي القادم**
[المهمة الأهم التي يجب التركيز عليها]

⚡ **طاقة اليوم**
[رسالة تحفيزية قوية ومخصصة]

🌟 **اقتباس اليوم**
"[اقتباس تحفيزي مختلف في كل مرة]"

=== قواعد ===
- كن إيجابياً ومحفزاً
- خصص الرسالة بناءً على المهام الفعلية
- اجعل الاقتباس مختلفاً في كل مرة
- لا تكرر نفس الرسائل
PROMPT;

        $response = $this->aiService->generateResponse($prompt);
        return response()->json(['response' => $response]);
    }

    private function getArabicDayName($dayOfWeek)
    {
        $days = [
            0 => 'الأحد',
            1 => 'الإثنين',
            2 => 'الثلاثاء',
            3 => 'الأربعاء',
            4 => 'الخميس',
            5 => 'الجمعة',
            6 => 'السبت'
        ];
        return $days[$dayOfWeek] ?? '';
    }
}
