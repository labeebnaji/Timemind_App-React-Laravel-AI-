import { useState, useEffect } from 'react'
import { analyticsAPI, tasksAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    todayTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    urgentTasks: [],
    upcomingTasks: []
  })
  const [weeklyData, setWeeklyData] = useState([])
  const [priorityData, setPriorityData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [dashboardRes, tasksRes, weeklyRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        tasksAPI.getAll(),
        analyticsAPI.getWeekly()
      ])
      
      const tasks = tasksRes.data
      const today = new Date().toISOString().split('T')[0]
      
      // Calculate priority distribution from real data
      const highPriority = tasks.filter(t => !t.completed && t.priority === 'high').length
      const mediumPriority = tasks.filter(t => !t.completed && t.priority === 'medium').length
      const lowPriority = tasks.filter(t => !t.completed && t.priority === 'low').length
      
      setPriorityData([
        { name: 'عالية', value: highPriority || 0, color: '#EF4444' },
        { name: 'متوسطة', value: mediumPriority || 0, color: '#F59E0B' },
        { name: 'منخفضة', value: lowPriority || 0, color: '#3B82F6' }
      ])

      // Set weekly data from API
      if (weeklyRes.data && Array.isArray(weeklyRes.data)) {
        setWeeklyData(weeklyRes.data.map(d => ({
          day: d.day || d.date,
          completed: d.completed || 0
        })))
      }
      
      setStats({
        totalTasks: dashboardRes.data.total_tasks || tasks.length,
        completedTasks: dashboardRes.data.completed_tasks || tasks.filter(t => t.completed).length,
        todayTasks: dashboardRes.data.today_tasks || tasks.filter(t => t.deadline === today).length,
        overdueTasks: dashboardRes.data.overdue_tasks || tasks.filter(t => !t.completed && t.deadline < today).length,
        completionRate: dashboardRes.data.completion_rate || 0,
        urgentTasks: tasks.filter(t => !t.completed && t.priority === 'high').slice(0, 5),
        upcomingTasks: tasks.filter(t => !t.completed).slice(0, 5)
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          مرحباً، {user?.name} 👋
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="إجمالي المهام"
          value={stats.totalTasks}
          icon="📋"
          gradient="from-blue-500 to-blue-600"
          textColor="text-blue-100"
        />
        <StatCard
          title="المهام المكتملة"
          value={stats.completedTasks}
          icon="✅"
          gradient="from-green-500 to-green-600"
          textColor="text-green-100"
        />
        <StatCard
          title="المهام المتأخرة"
          value={stats.overdueTasks}
          icon="⚠️"
          gradient="from-red-500 to-red-600"
          textColor="text-red-100"
        />
        <StatCard
          title="معدل الإنجاز"
          value={`${stats.completionRate}%`}
          icon="📊"
          gradient="from-purple-500 to-purple-600"
          textColor="text-purple-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Performance */}
        <div className="card !p-4 sm:!p-6">
          <h2 className="text-base sm:text-lg font-bold mb-4">📈 الإنتاجية الأسبوعية</h2>
          <div className="h-48 sm:h-64 lg:h-72">
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} name="المهام المكتملة" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                لا توجد بيانات أسبوعية بعد
              </div>
            )}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card !p-4 sm:!p-6">
          <h2 className="text-base sm:text-lg font-bold mb-4">🎯 توزيع الأولويات</h2>
          <div className="h-48 sm:h-64 lg:h-72">
            {priorityData.some(p => p.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius="70%"
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                لا توجد مهام بعد
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Urgent Tasks */}
      <div className="card !p-4 sm:!p-6">
        <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          <span>🔥</span> المهام العاجلة
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {stats.urgentTasks.length > 0 ? (
            stats.urgentTasks.map(task => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 bg-red-50 border-r-4 border-red-500 rounded-lg">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{task.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{task.description}</p>
                </div>
                <span className="text-xs sm:text-sm text-red-600 font-semibold whitespace-nowrap">
                  {new Date(task.deadline).toLocaleDateString('ar-EG')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm sm:text-base">لا توجد مهام عاجلة 🎉</p>
          )}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="card !p-4 sm:!p-6">
        <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          <span>📅</span> المهام القادمة
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {stats.upcomingTasks.length > 0 ? (
            stats.upcomingTasks.map(task => (
              <div key={task.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 rounded-lg ${
                task.priority === 'high' ? 'bg-red-50 border-r-4 border-red-500' :
                task.priority === 'medium' ? 'bg-yellow-50 border-r-4 border-yellow-500' :
                'bg-blue-50 border-r-4 border-blue-500'
              }`}>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{task.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">📂 {task.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === 'high' ? 'bg-red-200 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-200 text-yellow-700' :
                      'bg-blue-200 text-blue-700'
                    }`}>
                      {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                    </span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 font-semibold whitespace-nowrap">
                  {new Date(task.deadline).toLocaleDateString('ar-EG')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm sm:text-base">لا توجد مهام قادمة</p>
          )}
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon, gradient, textColor }) => (
  <div className={`bg-gradient-to-br ${gradient} text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-lg hover:shadow-xl transition-shadow`}>
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className={`${textColor} text-xs sm:text-sm mb-1 truncate`}>{title}</p>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black">{value}</h3>
      </div>
      <span className="text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">{icon}</span>
    </div>
  </div>
)

export default Dashboard