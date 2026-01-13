import { useState, useEffect } from 'react'
import { tasksAPI } from '../services/api'

const DailyTasks = ({ user }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: new Date().toISOString().split('T')[0],
    category: 'personal'
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getAll()
      setTasks(response.data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return
    try {
      await tasksAPI.create(newTask)
      setShowAddModal(false)
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        deadline: new Date().toISOString().split('T')[0],
        category: 'personal'
      })
      loadTasks()
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksAPI.complete(taskId)
      loadTasks()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      try {
        await tasksAPI.delete(taskId)
        loadTasks()
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => t.deadline === today)
  const upcomingTasks = tasks.filter(t => t.deadline > today)
  const overdueTasks = tasks.filter(t => t.deadline < today && !t.completed)

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
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">المهام اليومية ✅</h1>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="w-full sm:w-auto btn-primary text-sm sm:text-base !px-4 !py-2.5"
        >
          ➕ إضافة مهمة
        </button>
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <TaskSection
            title="مهام متأخرة"
            icon="⚠️"
            count={overdueTasks.length}
            tasks={overdueTasks}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
            isOverdue={true}
            titleColor="text-red-600"
          />
        )}

        {/* Today's Tasks */}
        <TaskSection
          title="مهام اليوم"
          icon="📅"
          count={todayTasks.length}
          tasks={todayTasks}
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
          emptyMessage="لا توجد مهام لهذا اليوم 🎉"
        />

        {/* Upcoming Tasks */}
        <TaskSection
          title="المهام القادمة"
          icon="🔜"
          count={upcomingTasks.length}
          tasks={upcomingTasks.slice(0, 5)}
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
        />
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">إضافة مهمة جديدة</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <FormField label="عنوان المهمة">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="input-field !text-sm sm:!text-base !py-2.5 sm:!py-3"
                placeholder="مثال: إنهاء التقرير الشهري"
              />
            </FormField>

            <FormField label="الوصف">
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="input-field !text-sm sm:!text-base !py-2.5 sm:!py-3"
                rows="2"
                placeholder="تفاصيل المهمة..."
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="الأولوية">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="input-field !text-sm sm:!text-base !py-2.5 sm:!py-3"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </FormField>

              <FormField label="التصنيف">
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="input-field !text-sm sm:!text-base !py-2.5 sm:!py-3"
                >
                  <option value="personal">شخصي</option>
                  <option value="work">عمل</option>
                  <option value="study">دراسة</option>
                  <option value="health">صحة</option>
                  <option value="other">أخرى</option>
                </select>
              </FormField>
            </div>

            <FormField label="الموعد النهائي">
              <input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                className="input-field !text-sm sm:!text-base !py-2.5 sm:!py-3"
              />
            </FormField>

            <div className="flex gap-3 mt-4 sm:mt-6">
              <button onClick={handleAddTask} className="flex-1 btn-primary !text-sm sm:!text-base !py-2.5">
                إضافة
              </button>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="flex-1 bg-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-300 font-medium text-sm sm:text-base transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

const TaskSection = ({ title, icon, count, tasks, onComplete, onDelete, isOverdue, emptyMessage, titleColor = '' }) => (
  <div>
    <h2 className={`text-base sm:text-lg font-bold mb-3 flex items-center gap-2 ${titleColor}`}>
      <span>{icon}</span> {title} ({count})
    </h2>
    <div className="space-y-2 sm:space-y-3">
      {tasks.length > 0 ? (
        tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onComplete}
            onDelete={onDelete}
            isOverdue={isOverdue}
          />
        ))
      ) : emptyMessage ? (
        <div className="card !p-6 sm:!p-8 text-center text-gray-500 text-sm sm:text-base">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  </div>
)

const TaskCard = ({ task, onComplete, onDelete, isOverdue }) => {
  const priorityStyles = {
    high: 'bg-gradient-to-r from-red-50 to-red-100 border-r-4 border-red-500',
    medium: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-r-4 border-yellow-500',
    low: 'bg-gradient-to-r from-blue-50 to-blue-100 border-r-4 border-blue-500'
  }

  const priorityLabels = {
    high: { text: 'عالي', bg: 'bg-red-500' },
    medium: { text: 'متوسط', bg: 'bg-yellow-500' },
    low: { text: 'منخفض', bg: 'bg-blue-500' }
  }

  return (
    <div className={`
      rounded-xl p-3 sm:p-4 shadow-sm transition-all
      ${priorityStyles[task.priority]}
      ${task.completed ? 'opacity-50' : ''}
      ${isOverdue ? 'ring-2 ring-red-400' : ''}
    `}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onComplete(task.id)}
          className="w-5 h-5 mt-0.5 cursor-pointer accent-blue-600 flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm sm:text-base ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-gray-600 mt-1 text-xs sm:text-sm line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1 text-gray-600">
              <span>📅</span> 
              <span className="hidden xs:inline">{new Date(task.deadline).toLocaleDateString('ar-EG')}</span>
              <span className="xs:hidden">{task.deadline}</span>
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <span>📂</span> {task.category}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-white text-xs ${priorityLabels[task.priority].bg}`}>
              {priorityLabels[task.priority].text}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-500 hover:bg-red-100 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      {children}
    </div>
  </div>
)

const FormField = ({ label, children }) => (
  <div>
    <label className="block font-medium mb-1.5 text-sm sm:text-base">{label}</label>
    {children}
  </div>
)

export default DailyTasks
