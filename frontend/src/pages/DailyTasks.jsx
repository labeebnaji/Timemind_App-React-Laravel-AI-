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

  const todayTasks = tasks.filter(t => t.deadline === new Date().toISOString().split('T')[0])
  const upcomingTasks = tasks.filter(t => t.deadline > new Date().toISOString().split('T')[0])
  const overdueTasks = tasks.filter(t => t.deadline < new Date().toISOString().split('T')[0] && !t.completed)

  if (loading) {
    return <div className="text-center py-20">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المهام اليومية ✅</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          ➕ إضافة مهمة جديدة
        </button>
      </div>

      {/* Timeline View */}
      <div className="space-y-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-danger flex items-center gap-2">
              <span>⚠️</span> مهام متأخرة ({overdueTasks.length})
            </h2>
            <div className="space-y-3">
              {overdueTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  isOverdue={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Today's Tasks */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📅</span> مهام اليوم ({todayTasks.length})
          </h2>
          <div className="space-y-3">
            {todayTasks.length > 0 ? (
              todayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                />
              ))
            ) : (
              <div className="card text-center py-8 text-gray-500">
                لا توجد مهام لهذا اليوم 🎉
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🔜</span> المهام القادمة ({upcomingTasks.length})
          </h2>
          <div className="space-y-3">
            {upcomingTasks.slice(0, 5).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">إضافة مهمة جديدة</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">عنوان المهمة</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-field"
                  placeholder="مثال: إنهاء التقرير الشهري"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">الوصف</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="تفاصيل المهمة..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">الأولوية</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">الموعد النهائي</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">التصنيف</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="input-field"
                >
                  <option value="personal">شخصي</option>
                  <option value="work">عمل</option>
                  <option value="study">دراسة</option>
                  <option value="health">صحة</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={handleAddTask} className="flex-1 btn-primary">
                  إضافة
                </button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const TaskCard = ({ task, onComplete, onDelete, isOverdue }) => {
  const priorityClass = task.priority === 'high' ? 'priority-high' :
                       task.priority === 'medium' ? 'priority-medium' : 'priority-low'
  
  return (
    <div className={`card ${priorityClass} ${task.completed ? 'opacity-50' : ''} ${isOverdue ? 'border-2 border-danger' : ''}`}>
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onComplete(task.id)}
          className="w-6 h-6 mt-1 cursor-pointer"
        />
        
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          <p className="text-gray-600 mt-1">{task.description}</p>
          
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1">
              <span>📅</span> {new Date(task.deadline).toLocaleDateString('ar-EG')}
            </span>
            <span className="flex items-center gap-1">
              <span>📂</span> {task.category}
            </span>
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
        
        <button
          onClick={() => onDelete(task.id)}
          className="text-danger hover:bg-red-50 p-2 rounded-lg"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

export default DailyTasks
