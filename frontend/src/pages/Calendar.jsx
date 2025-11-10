import { useState, useEffect } from 'react'
import { tasksAPI } from '../services/api'

const Calendar = ({ user }) => {
  const [tasks, setTasks] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // month, week, day
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getAll()
      setTasks(response.data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(task => task.deadline === dateStr)
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const renderMonthView = () => {
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayTasks = getTasksForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`p-2 border border-gray-200 min-h-[100px] cursor-pointer hover:bg-blue-50 transition-colors ${
            isToday ? 'bg-blue-100 border-primary border-2' : ''
          }`}
        >
          <div className={`font-semibold mb-2 ${isToday ? 'text-primary' : ''}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayTasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                className={`text-xs p-1 rounded truncate ${
                  task.priority === 'high' ? 'bg-red-200' :
                  task.priority === 'medium' ? 'bg-yellow-200' :
                  'bg-blue-200'
                }`}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-xs text-gray-500">+{dayTasks.length - 3} أخرى</div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">التقويم 📅</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg ${view === 'day' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            يومي
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg ${view === 'week' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            أسبوعي
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg ${view === 'month' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            شهري
          </button>
        </div>
      </div>

      <div className="card">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={previousMonth} className="btn-primary">
            ◀ السابق
          </button>
          <h2 className="text-2xl font-bold">
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className="btn-primary">
            التالي ▶
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center font-semibold bg-gray-100">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0">
          {renderMonthView()}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">
            مهام يوم {selectedDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <div className="space-y-3">
            {getTasksForDate(selectedDate).length > 0 ? (
              getTasksForDate(selectedDate).map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg ${
                    task.priority === 'high' ? 'priority-high' :
                    task.priority === 'medium' ? 'priority-medium' :
                    'priority-low'
                  }`}
                >
                  <h4 className="font-semibold">{task.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>📂 {task.category}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-danger text-white' :
                      task.priority === 'medium' ? 'bg-warning text-white' :
                      'bg-primary text-white'
                    }`}>
                      {task.priority === 'high' ? 'عالي' :
                       task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد مهام في هذا اليوم</p>
            )}
          </div>
        </div>
      )}

      {/* Task Density Indicator */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">كثافة المهام</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">مزدحم جداً (5+ مهام)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm">مزدحم (3-4 مهام)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">عادي (1-2 مهام)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">فارغ</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
