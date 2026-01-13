import { useState } from 'react'
import { swotAPI, tasksAPI } from '../services/api'

const SwotAnalysis = ({ user }) => {
  const [input, setInput] = useState('')
  const [period, setPeriod] = useState('weekly')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError('الرجاء إدخال المهام والمسؤوليات')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await swotAPI.analyze({
        text: input,
        period: period,
        user_id: user.id
      })
      
      setAnalysis(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'فشل التحليل')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptPlan = async () => {
    if (!analysis) return

    try {
      // Save organized tasks to database
      for (const task of analysis.organized_tasks) {
        await tasksAPI.create(task)
      }
      
      alert('تم حفظ الخطة بنجاح! ✅')
      setInput('')
      setAnalysis(null)
    } catch (err) {
      setError('فشل حفظ الخطة')
    }
  }

  const handleReanalyze = () => {
    setAnalysis(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      <div className="text-center sm:text-right">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3">
          تحليل SWOT الذكي 🧠
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600">أدخل مهامك بأي شكل تريد، والذكاء الاصطناعي سينظمها لك</p>
      </div>

      {!analysis ? (
        <div className="card">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                أدخل مهامك ومسؤولياتك (بأي شكل تريد)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-3 sm:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-purple-200 focus:border-purple-500 min-h-[180px] sm:min-h-[220px] lg:min-h-[250px] text-sm sm:text-base lg:text-lg transition-all resize-none"
                placeholder="مثال: عندي امتحان يوم الخميس لازم ادرس واجبات واروح الجامعة وبعدين عندي مشروع وعلي زيارة للطبيب واجتماع مع المدير..."
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">الفترة الزمنية</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {[
                  { value: 'daily', label: 'يومي', icon: '📅' },
                  { value: 'weekly', label: 'أسبوعي', icon: '📆' },
                  { value: 'monthly', label: 'شهري', icon: '🗓️' },
                  { value: 'yearly', label: 'سنوي', icon: '📊' }
                ].map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`p-2 sm:p-3 lg:p-4 rounded-lg border-2 transition-all ${
                      period === p.value
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl block mb-1 sm:mb-2">{p.icon}</span>
                    <span className="font-semibold text-xs sm:text-sm lg:text-base">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-danger text-danger px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 text-sm sm:text-base lg:text-lg py-3 sm:py-4"
            >
              {loading ? '🤖 جاري التحليل بالذكاء الاصطناعي...' : '🧠 تحليل بالذكاء الاصطناعي'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* SWOT Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <div className="card bg-green-50 border-r-4 border-secondary">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <span>💪</span> نقاط القوة
              </h3>
              <ul className="space-y-2">
                {analysis.swot?.strengths?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm sm:text-base">
                    <span className="text-secondary flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card bg-red-50 border-r-4 border-danger">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <span>⚠️</span> نقاط الضعف
              </h3>
              <ul className="space-y-2">
                {analysis.swot?.weaknesses?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm sm:text-base">
                    <span className="text-danger flex-shrink-0">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card bg-blue-50 border-r-4 border-primary">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <span>🎯</span> الفرص
              </h3>
              <ul className="space-y-2">
                {analysis.swot?.opportunities?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm sm:text-base">
                    <span className="text-primary flex-shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card bg-yellow-50 border-r-4 border-warning">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <span>⚡</span> التهديدات
              </h3>
              <ul className="space-y-2">
                {analysis.swot?.threats?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm sm:text-base">
                    <span className="text-warning flex-shrink-0">!</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Organized Tasks */}
          <div className="card">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4">📋 المهام المنظمة</h3>
            <div className="space-y-2 sm:space-y-3">
              {analysis.organized_tasks?.map((task, i) => (
                <div
                  key={i}
                  className={`p-3 sm:p-4 rounded-lg ${
                    task.priority === 'high' ? 'priority-high' :
                    task.priority === 'medium' ? 'priority-medium' :
                    'priority-low'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 w-full">
                      <h4 className="font-semibold text-sm sm:text-base lg:text-lg">{task.title}</h4>
                      <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mt-2 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                          <span>📅</span> {task.deadline}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📂</span> {task.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>⏱️</span> {task.estimated_time}
                        </span>
                      </div>
                    </div>
                    <div className="text-center w-full sm:w-auto">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                        task.priority === 'high' ? 'bg-danger text-white' :
                        task.priority === 'medium' ? 'bg-warning text-white' :
                        'bg-primary text-white'
                      }`}>
                        {task.priority === 'high' ? 'عالي' :
                         task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Schedule */}
          {analysis.schedule && (
            <div className="card !p-4 sm:!p-6 md:!p-8 bg-gradient-to-br from-purple-50 to-indigo-50">
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">🗓️ الجدول الزمني المقترح</h3>
              <div className="space-y-2">
                {analysis.schedule.map((item, i) => (
                  <div key={i} className="p-2 sm:p-3 bg-white rounded-lg text-sm sm:text-base">
                    <span className="font-semibold">{item.time}:</span> {item.task}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button onClick={handleAcceptPlan} className="flex-1 btn-secondary text-sm sm:text-base !py-3 sm:!py-3.5">
              ✅ قبول الخطة وحفظها
            </button>
            <button onClick={handleReanalyze} className="flex-1 btn-primary text-sm sm:text-base !py-3 sm:!py-3.5">
              🔄 إعادة التحليل
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SwotAnalysis
