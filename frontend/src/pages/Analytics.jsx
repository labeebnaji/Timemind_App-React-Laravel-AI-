import { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Analytics = ({ user }) => {
  const [period, setPeriod] = useState('weekly')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      const response = period === 'weekly' 
        ? await analyticsAPI.getWeekly()
        : await analyticsAPI.getMonthly()
      setStats(response.data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const productivityData = [
    { time: '6-8', tasks: 2 },
    { time: '8-10', tasks: 8 },
    { time: '10-12', tasks: 12 },
    { time: '12-14', tasks: 6 },
    { time: '14-16', tasks: 10 },
    { time: '16-18', tasks: 9 },
    { time: '18-20', tasks: 5 },
    { time: '20-22', tasks: 3 }
  ]

  const weeklyComparison = [
    { week: 'الأسبوع 1', planned: 40, completed: 35 },
    { week: 'الأسبوع 2', planned: 45, completed: 42 },
    { week: 'الأسبوع 3', planned: 38, completed: 38 },
    { week: 'الأسبوع 4', planned: 50, completed: 45 }
  ]

  const categoryData = [
    { name: 'عمل', value: 35, color: '#3B82F6' },
    { name: 'دراسة', value: 25, color: '#10B981' },
    { name: 'شخصي', value: 20, color: '#F59E0B' },
    { name: 'صحة', value: 15, color: '#EF4444' },
    { name: 'أخرى', value: 5, color: '#6B7280' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">التقارير والإحصائيات 📊</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-lg ${period === 'weekly' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            أسبوعي
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg ${period === 'monthly' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            شهري
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 mb-1">إجمالي المهام</p>
          <h3 className="text-4xl font-bold">16</h3>
          <p className="text-sm text-blue-100 mt-2">↑ 12% عن الأسبوع الماضي</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 mb-1">معدل الإنجاز</p>
          <h3 className="text-4xl font-bold">87%</h3>
          <p className="text-sm text-green-100 mt-2">↑ 5% عن الأسبوع الماضي</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-purple-100 mb-1">متوسط الوقت</p>
          <h3 className="text-4xl font-bold">2.5 ساعة</h3>
          <p className="text-sm text-purple-100 mt-2">لكل مهمة</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-orange-100 mb-1">الإنتاجية</p>
          <h3 className="text-4xl font-bold">9.2/10</h3>
          <p className="text-sm text-orange-100 mt-2">تقييم ممتاز</p>
        </div>
      </div>

      {/* Productivity by Time */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">الإنتاجية حسب الوقت</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={productivityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="tasks" stroke="#3B82F6" strokeWidth={3} name="المهام المنجزة" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="font-semibold text-primary">💡 رؤية ذكية</p>
          <p className="text-sm text-gray-600 mt-1">
            أنت أكثر إنتاجية بين الساعة 10-12 صباحاً. حاول جدولة المهام الصعبة في هذا الوقت.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Comparison */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">المخطط مقابل المنجز</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill="#93C5FD" name="المخطط" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completed" fill="#3B82F6" name="المنجز" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">توزيع المهام حسب الفئة</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card bg-gradient-to-br from-indigo-50 to-purple-50">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🤖</span> تقارير الذكاء الاصطناعي
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border-r-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📈</span>
              <h3 className="font-semibold">تحسن ملحوظ</h3>
            </div>
            <p className="text-sm text-gray-600">
              معدل إنجازك تحسن بنسبة 15% هذا الشهر مقارنة بالشهر الماضي
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border-r-4 border-secondary">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <h3 className="font-semibold">توفير الوقت</h3>
            </div>
            <p className="text-sm text-gray-600">
              تجميع المهام المتشابهة يمكن أن يوفر لك 3 ساعات أسبوعياً
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border-r-4 border-warning">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏰</span>
              <h3 className="font-semibold">نمط زمني</h3>
            </div>
            <p className="text-sm text-gray-600">
              المهام المتعلقة بالعمل تأخذ وقتاً أطول من المتوقع بنسبة 20%
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border-r-4 border-danger">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎯</span>
              <h3 className="font-semibold">اقتراح</h3>
            </div>
            <p className="text-sm text-gray-600">
              لديك 5 مهام متأخرة، يُنصح بإعادة تقييم الأولويات
            </p>
          </div>
        </div>
      </div>

      {/* Habits Tracking */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">تتبع العادات</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">الالتزام بالمواعيد</span>
              <span className="text-secondary font-bold">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-secondary h-3 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">إكمال المهام في الوقت المحدد</span>
              <span className="text-primary font-bold">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-primary h-3 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">تنظيم المهام اليومية</span>
              <span className="text-warning font-bold">78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-warning h-3 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">استخدام فترات الراحة</span>
              <span className="text-danger font-bold">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-danger h-3 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
