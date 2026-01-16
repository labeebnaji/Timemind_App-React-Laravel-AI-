import { useState, useEffect } from 'react'
import { tasksAPI } from '../services/api'
import { useNotifications } from '../components/Layout'
import { CheckCircle2, Plus, Edit3, Trash2, X } from 'lucide-react'

const DailyTasks = ({ user }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [aiTips, setAiTips] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: new Date().toISOString().split('T')[0],
    category: 'personal'
  })
  const [editTask, setEditTask] = useState(null)
  
  const notificationContext = useNotifications()

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
      if (notificationContext?.refreshNotifications) {
        notificationContext.refreshNotifications()
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleUpdateTask = async () => {
    if (!editTask?.title?.trim()) return
    try {
      await tasksAPI.update(editTask.id, editTask)
      setShowEditModal(false)
      setEditTask(null)
      loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
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

  const handleOpenDetail = async (task) => {
    setSelectedTask(task)
    setShowDetailModal(true)
    setAiTips(null)
    setAiLoading(true)
    
    try {
      const response = await tasksAPI.getAITips(task.id)
      setAiTips(response.data)
    } catch (error) {
      console.error('Error loading AI tips:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const handleOpenEdit = (task) => {
    setEditTask({ ...task })
    setShowEditModal(true)
  }

  const today = new Date().toISOString().split('T')[0]
  
  const sortByPriority = (tasks) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 }
    return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }
  
  const incompleteTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  
  const todayTasks = sortByPriority(incompleteTasks.filter(t => t.deadline === today))
  const upcomingTasks = sortByPriority(incompleteTasks.filter(t => t.deadline > today))
  const overdueTasks = sortByPriority(incompleteTasks.filter(t => t.deadline < today))

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
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <CheckCircle2 className="text-green-600" size={28} />
          المهام اليومية
        </h1>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="w-full sm:w-auto btn-primary text-sm sm:text-base !px-4 !py-2.5 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          إضافة مهمة
        </button>
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        {overdueTasks.length > 0 && (
          <TaskSection
            title="مهام متأخرة"
            count={overdueTasks.length}
            tasks={overdueTasks}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
            onEdit={handleOpenEdit}
            onOpenDetail={handleOpenDetail}
            isOverdue={true}
            titleColor="text-red-600"
          />
        )}

        <TaskSection
          title="مهام اليوم"
          count={todayTasks.length}
          tasks={todayTasks}
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
          onEdit={handleOpenEdit}
          onOpenDetail={handleOpenDetail}
          emptyMessage="لا توجد مهام لهذا اليوم"
        />

        <TaskSection
          title="المهام القادمة"
          count={upcomingTasks.length}
          tasks={upcomingTasks}
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
          onEdit={handleOpenEdit}
          onOpenDetail={handleOpenDetail}
        />

        {completedTasks.length > 0 && (
          <TaskSection
            title="المهام المكتملة"
            count={completedTasks.length}
            tasks={completedTasks}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
            onEdit={handleOpenEdit}
            onOpenDetail={handleOpenDetail}
            isCompleted={true}
            titleColor="text-green-600"
          />
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">إضافة مهمة جديدة</h2>
          <TaskForm 
            task={newTask} 
            setTask={setNewTask} 
            onSubmit={handleAddTask}
            onCancel={() => setShowAddModal(false)}
            submitText="إضافة"
          />
        </Modal>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editTask && (
        <Modal onClose={() => setShowEditModal(false)}>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">تعديل المهمة</h2>
          <TaskForm 
            task={editTask} 
            setTask={setEditTask} 
            onSubmit={handleUpdateTask}
            onCancel={() => setShowEditModal(false)}
            submitText="حفظ التعديلات"
          />
        </Modal>
      )}

      {/* Task Detail Modal with AI Tips */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          aiTips={aiTips}
          aiLoading={aiLoading}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedTask(null)
            setAiTips(null)
          }}
          onEdit={() => {
            setShowDetailModal(false)
            handleOpenEdit(selectedTask)
          }}
        />
      )}
    </div>
  )
}

const TaskSection = ({ title, count, tasks, onComplete, onDelete, onEdit, onOpenDetail, isOverdue, isCompleted, emptyMessage, titleColor = '' }) => (
  <div>
    <h2 className={`text-base sm:text-lg font-bold mb-3 ${titleColor}`}>
      {title} ({count})
    </h2>
    <div className="space-y-2 sm:space-y-3">
      {tasks.length > 0 ? (
        tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onOpenDetail={onOpenDetail}
            isOverdue={isOverdue}
            isCompleted={isCompleted}
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

const TaskCard = ({ task, onComplete, onDelete, onEdit, onOpenDetail, isOverdue, isCompleted }) => {
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

  const today = new Date().toISOString().split('T')[0]
  const isDeadlinePassed = task.deadline < today
  
  // Can uncomplete only if deadline hasn't passed
  const canToggleComplete = !task.completed || !isDeadlinePassed
  // Can edit only if not completed
  const canEdit = !task.completed

  return (
    <div 
      className={`
        rounded-xl p-3 sm:p-4 shadow-sm transition-all cursor-pointer hover:shadow-md
        ${isCompleted ? 'bg-gradient-to-r from-green-50 to-green-100 border-r-4 border-green-500' : priorityStyles[task.priority]}
        ${isOverdue ? 'ring-2 ring-red-400' : ''}
      `}
      onClick={() => onOpenDetail(task)}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => {
            e.stopPropagation()
            if (canToggleComplete) {
              onComplete(task.id)
            }
          }}
          disabled={!canToggleComplete}
          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${canToggleComplete ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} accent-green-600`}
        />
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm sm:text-base ${task.completed ? 'text-green-700' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-gray-600 mt-1 text-xs sm:text-sm line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs">
            <span className="text-gray-600">
              {new Date(task.deadline).toLocaleDateString('ar-EG')}
            </span>
            <span className="text-gray-600">{task.category}</span>
            <span className={`px-2 py-0.5 rounded-full text-white text-xs ${priorityLabels[task.priority].bg}`}>
              {priorityLabels[task.priority].text}
            </span>
          </div>
        </div>
        
        <div className="flex gap-1">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
              className="text-blue-500 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
              title="تعديل"
            >
              <Edit3 size={16} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
            title="حذف"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

const TaskDetailModal = ({ task, aiTips, aiLoading, onClose, onEdit }) => {
  const priorityLabels = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' }
  const categoryLabels = { work: 'عمل', study: 'دراسة', personal: 'شخصي', health: 'صحة', other: 'أخرى' }
  
  // Can edit only if not completed
  const canEdit = !task.completed

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold">{task.title}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs text-white ${
                  task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}>
                  {priorityLabels[task.priority]}
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-gray-200">
                  {categoryLabels[task.category] || task.category}
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-gray-200">
                  {new Date(task.deadline).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          {task.description && (
            <p className="text-gray-600 mt-3 text-sm">{task.description}</p>
          )}
        </div>

        {/* AI Tips Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">AI</span>
            نصائح الذكاء الاصطناعي
          </h3>

          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-purple-600 animate-spin"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 animate-pulse"></div>
              </div>
              <p className="text-gray-500 mt-4 text-sm">جاري تحليل المهمة...</p>
            </div>
          ) : aiTips ? (
            <div className="space-y-4">
              {/* Check if completed task response */}
              {aiTips.is_completed ? (
                // Completed Task View
                <>
                  {/* Congratulation Banner */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white text-center">
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="font-bold text-lg">{aiTips.summary}</p>
                  </div>

                  {/* Achievement Card */}
                  {aiTips.achievement && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-2xl">
                          🏆
                        </div>
                        <div>
                          <h4 className="font-bold text-amber-800">{aiTips.achievement.title}</h4>
                          <p className="text-sm text-amber-600">{aiTips.achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  {aiTips.stats && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500">التصنيف</p>
                        <p className="font-bold text-sm">{aiTips.stats.task_type}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500">الأولوية</p>
                        <p className="font-bold text-sm">{aiTips.stats.priority}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500">الحالة</p>
                        <p className="font-bold text-sm text-green-600">{aiTips.stats.status}</p>
                      </div>
                    </div>
                  )}

                  {/* Next Tips */}
                  {aiTips.next_tips && aiTips.next_tips.length > 0 && (
                    <div>
                      <h4 className="font-bold text-sm mb-3">نصائح للمهام القادمة</h4>
                      <div className="space-y-2">
                        {aiTips.next_tips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2 bg-blue-50 rounded-lg p-3">
                            <span className="text-blue-600">💡</span>
                            <p className="text-sm text-gray-700">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Motivation Quote */}
                  {aiTips.motivation && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                      <p className="text-purple-700 italic">"{aiTips.motivation}"</p>
                    </div>
                  )}
                </>
              ) : (
                // Regular Task View (not completed)
                <>
                  {/* Summary */}
                  {aiTips.summary && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                      <p className="text-gray-700">{aiTips.summary}</p>
                    </div>
                  )}

                  {/* Steps */}
                  {aiTips.steps && aiTips.steps.length > 0 && (
                    <div>
                      <h4 className="font-bold text-sm mb-3">خطوات الإنجاز</h4>
                      <div className="space-y-3">
                        {aiTips.steps.map((step, index) => (
                          <div key={index} className="flex gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {step.number || index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{step.title}</h5>
                              <p className="text-gray-500 text-xs mt-1">{step.description}</p>
                              {step.duration && (
                                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                  {step.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {aiTips.tips && aiTips.tips.length > 0 && (
                    <div>
                      <h4 className="font-bold text-sm mb-3">نصائح سريعة</h4>
                      <div className="grid gap-2">
                        {aiTips.tips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2 bg-green-50 rounded-lg p-3">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <p className="text-sm text-gray-700">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Best Time & Motivation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aiTips.best_time && (
                      <div className="bg-orange-50 rounded-xl p-3">
                        <h5 className="font-medium text-xs text-orange-600 mb-1">أفضل وقت</h5>
                        <p className="text-sm">{aiTips.best_time}</p>
                      </div>
                    )}
                    {aiTips.motivation && (
                      <div className="bg-purple-50 rounded-xl p-3">
                        <h5 className="font-medium text-xs text-purple-600 mb-1">تحفيز</h5>
                        <p className="text-sm">{aiTips.motivation}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>لم نتمكن من تحميل النصائح</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          {canEdit && (
            <button onClick={onEdit} className="flex-1 btn-primary !py-2.5">
              تعديل المهمة
            </button>
          )}
          <button onClick={onClose} className={`${canEdit ? 'flex-1' : 'w-full'} bg-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-300 font-medium transition-colors`}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}

const TaskForm = ({ task, setTask, onSubmit, onCancel, submitText }) => (
  <div className="space-y-3 sm:space-y-4">
    <FormField label="عنوان المهمة">
      <input
        type="text"
        value={task.title}
        onChange={(e) => setTask({ ...task, title: e.target.value })}
        className="input-field !text-sm sm:!text-base !py-2.5 sm:!py-3"
        placeholder="مثال: إنهاء التقرير الشهري"
      />
    </FormField>

    <FormField label="الوصف">
      <textarea
        value={task.description || ''}
        onChange={(e) => setTask({ ...task, description: e.target.value })}
        className="input-field !text-sm sm:!text-base !py-2.5 sm:!py-3"
        rows="2"
        placeholder="تفاصيل المهمة..."
      />
    </FormField>

    <div className="grid grid-cols-2 gap-3">
      <FormField label="الأولوية">
        <select
          value={task.priority}
          onChange={(e) => setTask({ ...task, priority: e.target.value })}
          className="input-field !text-sm sm:!text-base !py-2.5 sm:!py-3"
        >
          <option value="low">منخفضة</option>
          <option value="medium">متوسطة</option>
          <option value="high">عالية</option>
        </select>
      </FormField>

      <FormField label="التصنيف">
        <select
          value={task.category}
          onChange={(e) => setTask({ ...task, category: e.target.value })}
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
        value={task.deadline}
        onChange={(e) => setTask({ ...task, deadline: e.target.value })}
        className="input-field !text-sm sm:!text-base !py-2.5 sm:!py-3"
      />
    </FormField>

    <div className="flex gap-3 mt-4 sm:mt-6">
      <button onClick={onSubmit} className="flex-1 btn-primary !text-sm sm:!text-base !py-2.5">
        {submitText}
      </button>
      <button 
        onClick={onCancel} 
        className="flex-1 bg-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-300 font-medium text-sm sm:text-base transition-colors"
      >
        إلغاء
      </button>
    </div>
  </div>
)

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
