import { useState, useEffect } from 'react'
import { goalsAPI } from '../services/api'

const Goals = ({ user }) => {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingGoal, setEditingGoal] = useState(null)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    deadline: '',
    progress: 0
  })

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const response = await goalsAPI.getAll()
      setGoals(response.data)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return
    try {
      await goalsAPI.create(newGoal)
      setShowAddModal(false)
      setNewGoal({
        title: '',
        description: '',
        category: 'personal',
        deadline: '',
        progress: 0
      })
      loadGoals()
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const handleUpdateGoal = async () => {
    if (!editingGoal) return
    try {
      await goalsAPI.update(editingGoal.id, editingGoal)
      setShowEditModal(false)
      setEditingGoal(null)
      loadGoals()
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleDeleteGoal = async (goalId) => {
    if (confirm('هل أنت متأكد من حذف هذا الهدف؟')) {
      try {
        await goalsAPI.delete(goalId)
        loadGoals()
      } catch (error) {
        console.error('Error deleting goal:', error)
      }
    }
  }

  const openEditModal = (goal) => {
    setEditingGoal({ ...goal })
    setShowEditModal(true)
  }

  const categories = [
    { value: 'all', label: 'الكل', icon: '📋' },
    { value: 'personal', label: 'شخصي', icon: '🎯' },
    { value: 'professional', label: 'مهني', icon: '💼' },
    { value: 'educational', label: 'تعليمي', icon: '📚' },
    { value: 'health', label: 'صحي', icon: '🏋️' }
  ]

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(g => g.category === selectedCategory)

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
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">الأهداف طويلة المدى 🎯</h1>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="w-full sm:w-auto btn-primary text-sm sm:text-base !px-4 !py-2.5"
        >
          ➕ إضافة هدف
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg whitespace-nowrap transition-all text-sm sm:text-base
              ${selectedCategory === cat.value
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white hover:bg-gray-50 shadow-sm'
              }
            `}
          >
            <span className="text-lg sm:text-xl">{cat.icon}</span>
            <span className="font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {filteredGoals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            onEdit={() => openEditModal(goal)}
            onDelete={() => handleDeleteGoal(goal.id)}
          />
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className="card !p-8 sm:!p-12 text-center">
          <span className="text-4xl sm:text-5xl mb-4 block">🎯</span>
          <p className="text-gray-500 text-sm sm:text-base">لا توجد أهداف في هذا التصنيف</p>
        </div>
      )}

      {/* AI Insights */}
      <div className="card !p-4 sm:!p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
          <span>🤖</span> رؤى الذكاء الاصطناعي
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InsightCard
            icon="💡"
            title="اقتراح"
            description="تقسيم الهدف إلى مهام أصغر يزيد فرص النجاح بنسبة 80%"
            borderColor="border-blue-500"
          />
          <InsightCard
            icon="⚡"
            title="تحذير"
            description="لديك 3 أهداف بنفس الموعد النهائي، يُنصح بإعادة الجدولة"
            borderColor="border-yellow-500"
          />
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">إضافة هدف جديد</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <FormField label="عنوان الهدف">
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="input-field !text-sm sm:!text-base !py-2.5"
                placeholder="مثال: تعلم لغة جديدة"
              />
            </FormField>

            <FormField label="الوصف">
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="input-field !text-sm sm:!text-base !py-2.5"
                rows="2"
                placeholder="تفاصيل الهدف..."
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="التصنيف">
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="input-field !text-sm sm:!text-base !py-2.5"
                >
                  <option value="personal">شخصي</option>
                  <option value="professional">مهني</option>
                  <option value="educational">تعليمي</option>
                  <option value="health">صحي</option>
                </select>
              </FormField>

              <FormField label="الموعد المستهدف">
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="input-field !text-sm sm:!text-base !py-2.5"
                />
              </FormField>
            </div>

            <div className="flex gap-3 mt-4 sm:mt-6">
              <button onClick={handleAddGoal} className="flex-1 btn-primary !text-sm sm:!text-base !py-2.5">
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

      {/* Edit Goal Modal */}
      {showEditModal && editingGoal && (
        <Modal onClose={() => { setShowEditModal(false); setEditingGoal(null); }}>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">تعديل الهدف</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <FormField label="عنوان الهدف">
              <input
                type="text"
                value={editingGoal.title}
                onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                className="input-field !text-sm sm:!text-base !py-2.5"
              />
            </FormField>

            <FormField label="الوصف">
              <textarea
                value={editingGoal.description || ''}
                onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                className="input-field !text-sm sm:!text-base !py-2.5"
                rows="2"
              />
            </FormField>

            <FormField label="نسبة التقدم">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingGoal.progress || 0}
                  onChange={(e) => setEditingGoal({ ...editingGoal, progress: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="font-bold text-lg w-12 text-center">{editingGoal.progress || 0}%</span>
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="التصنيف">
                <select
                  value={editingGoal.category}
                  onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}
                  className="input-field !text-sm sm:!text-base !py-2.5"
                >
                  <option value="personal">شخصي</option>
                  <option value="professional">مهني</option>
                  <option value="educational">تعليمي</option>
                  <option value="health">صحي</option>
                </select>
              </FormField>

              <FormField label="الموعد المستهدف">
                <input
                  type="date"
                  value={editingGoal.deadline ? editingGoal.deadline.split('T')[0] : ''}
                  onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                  className="input-field !text-sm sm:!text-base !py-2.5"
                />
              </FormField>
            </div>

            <div className="flex gap-3 mt-4 sm:mt-6">
              <button onClick={handleUpdateGoal} className="flex-1 btn-primary !text-sm sm:!text-base !py-2.5">
                حفظ التغييرات
              </button>
              <button 
                onClick={() => { setShowEditModal(false); setEditingGoal(null); }} 
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

const GoalCard = ({ goal, onEdit, onDelete }) => {
  const categoryIcons = {
    personal: '🎯',
    professional: '💼',
    educational: '📚',
    health: '🏋️'
  }

  const progressColors = {
    high: 'bg-green-500',
    medium: 'bg-blue-500',
    low: 'bg-yellow-500',
    veryLow: 'bg-red-500'
  }

  const getProgressColor = (progress) => {
    if (progress >= 75) return progressColors.high
    if (progress >= 50) return progressColors.medium
    if (progress >= 25) return progressColors.low
    return progressColors.veryLow
  }

  const getProgressBadgeColor = (progress) => {
    if (progress >= 75) return 'bg-green-100 text-green-700'
    if (progress >= 50) return 'bg-blue-100 text-blue-700'
    if (progress >= 25) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="card !p-4 sm:!p-5 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl sm:text-3xl">
          {categoryIcons[goal.category] || '🎯'}
        </span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold ${getProgressBadgeColor(goal.progress || 0)}`}>
            {goal.progress || 0}%
          </span>
          <button 
            onClick={onDelete}
            className="text-red-500 hover:bg-red-100 p-1 rounded transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-bold mb-1.5 line-clamp-1">{goal.title}</h3>
      <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{goal.description}</p>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(goal.progress || 0)}`}
            style={{ width: `${goal.progress || 0}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
        <span className="flex items-center gap-1">
          📅 {goal.deadline ? new Date(goal.deadline).toLocaleDateString('ar-EG') : 'غير محدد'}
        </span>
        <button 
          onClick={onEdit}
          className="text-blue-600 hover:underline font-medium"
        >
          تحديث
        </button>
      </div>
    </div>
  )
}

const InsightCard = ({ icon, title, description, borderColor }) => (
  <div className={`p-3 sm:p-4 bg-white rounded-xl border-r-4 ${borderColor} shadow-sm`}>
    <p className="font-semibold text-sm sm:text-base flex items-center gap-2">
      <span>{icon}</span> {title}
    </p>
    <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>
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

export default Goals
