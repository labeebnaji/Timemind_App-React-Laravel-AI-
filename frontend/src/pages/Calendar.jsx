import { useState, useEffect } from 'react'
import { tasksAPI } from '../services/api'
import { Calendar as CalendarIcon, CalendarDays, CalendarRange, FolderOpen } from 'lucide-react'

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
  const dayNamesShort = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']

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
      days.push(<div key={`empty-${i}`} className="p-1 sm:p-2 border border-gray-200 min-h-[60px] sm:min-h-[80px] md:min-h-[100px]"></div>)
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
          className={`p-1 sm:p-2 border border-gray-200 min-h-[60px] sm:min-h-[80px] md:min-h-[100px] cursor-pointer hover:bg-blue-50 transition-colors ${
            isToday ? 'bg-blue-100 border-primary border-2' : ''
          }`}
        >
          <div className={`font-semibold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base ${isToday ? 'text-primary' : ''}`}>
            {day}
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            {dayTasks.slice(0, window.innerWidth < 640 ? 1 : 3).map(task => (
              <div
                key={task.id}
                className={`text-[10px] sm:text-xs p-0.5 sm:p-1 rounded truncate ${
                  task.priority === 'high' ? 'bg-red-200' :
                  task.priority === 'medium' ? 'bg-yellow-200' :
                  'bg-blue-200'
                }`}
              >
                <span className="hidden sm:inline">{task.title}</span>
                <span className="sm:hidden">•</span>
              </div>
            ))}
            {dayTasks.length > (window.innerWidth < 640 ? 1 : 3) && (
              <div className="text-[10px] sm:text-xs text-gray-500">+{dayTasks.length - (window.innerWidth < 640 ? 1 : 3)}</div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="text-blue-600" size={28} />
          التقويم
        </h1>
        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
          <button
            onClick={() => setView('day')}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1 ${view === 'day' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            <CalendarDays size={16} />
            يومي
          </button>
          <button
            onClick={() => setView('week')}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1 ${view === 'week' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            <CalendarIcon size={16} />
            أسبوعي
          </button>
          <button
            onClick={() => setView('month')}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1 ${view === 'month' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            <CalendarRange size={16} />
            شهري
          </button>
        </div>
      </div>

      <div className="card !p-3 sm:!p-6 md:!p-8">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button onClick={previousMonth} className="btn-primary !px-2 sm:!px-4 md:!px-8 !py-2 sm:!py-3 text-xs sm:text-sm md:text-base">
            <span className="hidden sm:inline">◀ السابق</span>
            <span className="sm:hidden">◀</span>
          </button>
          <h2 className="text-base sm:text-xl md:text-2xl font-bold">
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className="btn-primary !px-2 sm:!px-4 md:!px-8 !py-2 sm:!py-3 text-xs sm:text-sm md:text-base">
            <span className="hidden sm:inline">التالي ▶</span>
            <span className="sm:hidden">▶</span>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map((day, index) => (
            <div key={day} className="p-1 sm:p-2 text-center font-semibold bg-gray-100 text-[10px] sm:text-xs md:text-sm">
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{dayNamesShort[index]}</span>
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
        <div className="card !p-4 sm:!p-6 md:!p-8">
          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">
            مهام يوم {selectedDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {getTasksForDate(selectedDate).length > 0 ? (
              getTasksForDate(selectedDate).map(task => (
                <div
                  key={task.id}
                  className={`p-3 sm:p-4 rounded-lg ${
                    task.priority === 'high' ? 'priority-high' :
                    task.priority === 'medium' ? 'priority-medium' :
                    'priority-low'
                  }`}
                >
                  <h4 className="font-semibold text-sm sm:text-base">{task.title}</h4>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
                    <span>📂 {task.category}</span>
                    <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs ${
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
              <p className="text-gray-500 text-center py-4 text-sm sm:text-base">لا توجد مهام في هذا اليوم</p>
            )}
          </div>
        </div>
      )}

      {/* Task Density Indicator */}
      <div className="card !p-4 sm:!p-6 md:!p-8">
        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">كثافة المهام</h3>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded"></div>
            <span className="text-xs sm:text-sm">مزدحم جداً (5+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded"></div>
            <span className="text-xs sm:text-sm">مزدحم (3-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
            <span className="text-xs sm:text-sm">عادي (1-2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
            <span className="text-xs sm:text-sm">فارغ</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
