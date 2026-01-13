import { useState, useEffect } from 'react'
import { analyticsAPI, tasksAPI } from '../services/api'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Analytics = ({ user }) => {
  const [period, setPeriod] = useState('weekly')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    overdueTasks: 0
  })
  const [weeklyData, setWeeklyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [priorityData, setPriorityData] = useState([])

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [dashboardRes, tasksRes, periodRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        tasksAPI.getAll(),
        period === 'weekly' ? analyticsAPI.getWeekly() : analyticsAPI.getMonthly()
      ])

      const tasks = tasksRes.data
      
      // Set stats from dashboard
      setStats({
        totalTasks: dashboardRes.data.total_tasks || tasks.length,
        completedTasks: dashboardRes.data.completed_tasks || tasks.filter(t => t.completed).length,
        completionRate: dashboardRes.data.completion_rate || 0,
        overdueTasks: dashboardRes.data.overdue_tasks || 0
      })

      // Process weekly data
      if (period === 'weekly' && Array.isArray(periodRes.data)) {
        setWeeklyData(periodRes.data.map(d => ({
          day: d.day || d.date,
          completed: d.completed || 0,
          total: d.total || 0
        })))
      }

      // Calculate category distribution from real tasks
      const categoryColors = {
        'work': '#3B82F6',
        'study': '#10B981', 
        'personal': '#F59E0B',
        'health': '#EF4444',
        'other': '#6B7280',
        'عمل': '#3B82F6',
        'دراسة': '#10B981',
        'شخصي': '#F59E0B',
        'صحة': '#EF4444',
        'أخرى': '#6B7280'
      }

      const categoryLabels = {
        'work': 'عمل',
        'study': 'دراسة',
        'personal': 'شخصي',
        'health': 'صحة',
        'other': 'أخرى'
      }

      const categoryCounts = tasks.reduce((acc, task) => {
        const cat = task.category || 'other'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {})

      setCategoryData(Object.entries(categoryCounts).map(([name, value]) => ({
        name: categoryLabels[name] || name,
        value,
        color: categoryColors[name] || '#6B7280'
      })))

      // Calculate priority distribution
      const priorityCounts = tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1
        return acc
      }, {})

      setPriorityData([
        { name: 'عالية', value: priorityCounts.high || 0, color: '#EF4444' },
        { name: 'متوسطة', value: priorityCounts.medium || 0, color: '#F59E0B' },
        { name: 'منخفضة', value: priorityCounts.low || 0, color: '#3B82F6' }
      ])

    } catch (error) {
      console.error('Error loading analytics:', error)
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">التقارير والإحصائيات 📊</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
              period === 'weekly' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            أسبوعي
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
              period === 'monthly' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            شهري
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="إجمالي المهام"
          value={stats.totalTasks}
          icon="📋"
          gradient="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="المهام المكتملة"
          value={stats.completedTasks}
          icon="✅"
          gradient="from-green-500 to-green-600"
        />
        <MetricCard
          title="معدل الإنجاز"
          value={`${stats.completionRate}%`}
          icon="📊"
          gradient="from-purple-500 to-purple-600"
        />
        <MetricCard
          title="المهام المتأخرة"
          value={stats.overdueTasks}
          icon="⚠️"
          gradient="from-red-500 to-red-600"
        />
      </div>

      {/* Weekly Performance Chart */}
      <div className="card !p-4 sm:!p-6">
        <h2 className="text-base sm:text-lg font-bold mb-4">📈 الأداء الأسبوعي</h2>
        <div className="h-48 sm:h-64 lg:h-72">
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="total" fill="#93C5FD" name="إجمالي المهام" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#3B82F6" name="المكتملة" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              لا توجد بيانات أسبوعية بعد
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Distribution */}
        <div className="card !p-4 sm:!p-6">
          <h2 className="text-base sm:text-lg font-bold mb-4">📂 توزيع التصنيفات</h2>
          <div className="h-48 sm:h-64">
            {categoryData.length > 0 && categoryData.some(c => c.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius="70%"
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                لا توجد مهام بعد
              </div>
            )}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card !p-4 sm:!p-6">
          <h2 className="text-base sm:text-lg font-bold mb-4">🎯 توزيع الأولويات</h2>
          <div className="h-48 sm:h-64">
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

      {/* Progress Summary */}
      <div className="card !p-4 sm:!p-6">
        <h2 className="text-base sm:text-lg font-bold mb-4">📋 ملخص التقدم</h2>
        <div className="space-y-3 sm:space-y-4">
          <ProgressBar 
            label="معدل الإنجاز الكلي" 
            value={stats.completionRate} 
            color="bg-green-500" 
          />
          <ProgressBar 
            label="المهام المكتملة" 
            value={stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0} 
            color="bg-blue-500" 
          />
          <ProgressBar 
            label="المهام في الوقت" 
            value={stats.totalTasks > 0 ? Math.round(((stats.totalTasks - stats.overdueTasks) / stats.totalTasks) * 100) : 100} 
            color="bg-purple-500" 
          />
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card !p-4 text-center">
          <div className="text-3xl sm:text-4xl mb-2">📈</div>
          <h3 className="font-bold text-lg sm:text-xl text-green-600">{stats.completionRate}%</h3>
          <p className="text-gray-600 text-sm">معدل الإنجاز</p>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-3xl sm:text-4xl mb-2">✅</div>
          <h3 className="font-bold text-lg sm:text-xl text-blue-600">{stats.completedTasks}</h3>
          <p className="text-gray-600 text-sm">مهمة مكتملة</p>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-3xl sm:text-4xl mb-2">⏳</div>
          <h3 className="font-bold text-lg sm:text-xl text-orange-600">{stats.totalTasks - stats.completedTasks}</h3>
          <p className="text-gray-600 text-sm">مهمة متبقية</p>
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, icon, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-xs sm:text-sm mb-1">{title}</p>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">{value}</h3>
      </div>
      <span className="text-2xl sm:text-3xl">{icon}</span>
    </div>
  </div>
)

const ProgressBar = ({ label, value, color }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="font-medium text-sm sm:text-base">{label}</span>
      <span className={`font-bold text-sm sm:text-base ${
        value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600'
      }`}>{value}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
      <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
)

export default Analytics