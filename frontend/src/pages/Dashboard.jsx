import { useState, useEffect } from 'react'
import { analyticsAPI, tasksAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    todayCompleted: 0,
    todayTotal: 0,
    urgentTasks: [],
    upcomingTasks: [],
    aiSuggestions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, tasksRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        tasksAPI.getAll()
      ])
      
      const tasks = tasksRes.data
      const today = new Date().toISOString().split('T')[0]
      
      setStats({
        todayCompleted: tasks.filter(t => t.completed && t.deadline === today).length,
        todayTotal: tasks.filter(t => t.deadline === today).length,
        urgentTasks: tasks.filter(t => !t.completed && t.priority === 'high').slice(0, 5),
        upcomingTasks: tasks.filter(t => !t.completed).slice(0, 5),
        aiSuggestions: analyticsRes.data.suggestions || []
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const weeklyData = [
    { day: 'السبت', completed: 8 },
    { day: 'الأحد', completed: 12 },
    { day: 'الاثنين', completed: 10 },
    { day: 'الثلاثاء', completed: 15 },
    { day: 'الأربعاء', completed: 9 },
    { day: 'الخميس', completed: 14 },
    { day: 'الجمعة', completed: 6 }
  ]

  const priorityData = [
    { name: 'عالية', value: stats.urgentTasks.length, color: '#EF4444' },
    { name: 'متوسطة', value: 8, color: '#F59E0B' },
    { name: 'منخفضة', value: 12, color: '#3B82F6' }
  ]

  if (loading) {
    return <div className="text-center py-20">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          مرحباً، {user?.name} 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-semibold">
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-2 text-sm sm:text-base">المهام المكتملة اليوم</p>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black">{stats.todayCompleted}/{stats.todayTotal}</h3>
            </div>
            <span className="text-4xl sm:text-5xl lg:text-6xl">✅</span>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 mb-1">المهام العاجلة</p>
              <h3 className="text-4xl font-bold">{stats.urgentTasks.length}</h3>
            </div>
            <span className="text-5xl">🔥</span>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">المهام القادمة</p>
              <h3 className="text-4xl font-bold">{stats.upcomingTasks.length}</h3>
            </div>
            <span className="text-5xl">📅</span>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 mb-1">معدل الإنجاز</p>
              <h3 className="text-4xl font-bold">0%</h3>
            </div>
            <span className="text-5xl">📊</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">الإنتاجية الأسبوعية</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">توزيع الأولويات</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Urgent Tasks */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🔥</span> المهام العاجلة
        </h2>
        <div className="space-y-3">
          {stats.urgentTasks.length > 0 ? (
            stats.urgentTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-red-50 border-r-4 border-danger rounded-lg">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <span className="text-sm text-danger font-semibold">{task.deadline}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">لا توجد مهام عاجلة 🎉</p>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="card bg-gradient-to-br from-indigo-50 to-purple-50">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🤖</span> اقتراحات الذكاء الاصطناعي
        </h2>
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-lg border-r-4 border-primary">
            <p className="font-semibold">💡 أنت أكثر إنتاجية في الصباح</p>
            <p className="text-sm text-gray-600 mt-1">حاول جدولة المهام الصعبة بين 8-11 صباحاً</p>
          </div>
          <div className="p-4 bg-white rounded-lg border-r-4 border-secondary">
            <p className="font-semibold">⚡ توفير الوقت</p>
            <p className="text-sm text-gray-600 mt-1">تجميع المهام المتشابهة يمكن أن يوفر 3 ساعات أسبوعياً</p>
          </div>
          <div className="p-4 bg-white rounded-lg border-r-4 border-warning">
            <p className="font-semibold">⏰ تنبيه</p>
            <p className="text-sm text-gray-600 mt-1">لديك 5 مهام متأخرة، يُنصح بإعادة جدولتها</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
