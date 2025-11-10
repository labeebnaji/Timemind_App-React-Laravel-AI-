import { useState, useEffect } from 'react'
import { goalsAPI } from '../services/api'

const Goals = ({ user }) => {
  const [goals, setGoals] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
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
    }
  }

  const handleAddGoal = async () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الأهداف طويلة المدى 🎯</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          ➕ إضافة هدف جديد
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="font-semibold">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map(goal => (
          <div key={goal.id} className="card hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">
                {goal.category === 'personal' ? '🎯' :
                 goal.category === 'professional' ? '💼' :
                 goal.category === 'educational' ? '📚' : '🏋️'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                goal.progress >= 75 ? 'bg-green-100 text-green-700' :
                goal.progress >= 50 ? 'bg-blue-100 text-blue-700' :
                goal.progress >= 25 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {goal.progress}%
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
            <p className="text-gray-600 mb-4">{goal.description}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    goal.progress >= 75 ? 'bg-green-500' :
                    goal.progress >= 50 ? 'bg-blue-500' :
                    goal.progress >= 25 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>📅 {new Date(goal.deadline).toLocaleDateString('ar-EG')}</span>
              <button className="text-primary hover:underline">
                تحديث التقدم
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className="card text-center py-12">
          <span className="text-6xl mb-4 block">🎯</span>
          <p className="text-gray-500 text-lg">لا توجد أهداف في هذا التصنيف</p>
        </div>
      )}

      {/* AI Insights */}
      <div className="card bg-gradient-to-br from-purple-50 to-indigo-50">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🤖</span> رؤى الذكاء الاصطناعي
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-lg border-r-4 border-primary">
            <p className="font-semibold">💡 اقتراح</p>
            <p className="text-sm text-gray-600 mt-1">
              تقسيم الهدف "تعلم البرمجة" إلى مهام أصغر سيزيد من فرص النجاح بنسبة 80%
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border-r-4 border-secondary">
            <p className="font-semibold">⚡ تحذير</p>
            <p className="text-sm text-gray-600 mt-1">
              لديك 3 أهداف بنفس الموعد النهائي، يُنصح بإعادة الجدولة
            </p>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">إضافة هدف جديد</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">عنوان الهدف</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="input-field"
                  placeholder="مثال: تعلم لغة جديدة"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">الوصف</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="تفاصيل الهدف..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">التصنيف</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="input-field"
                >
                  <option value="personal">شخصي</option>
                  <option value="professional">مهني</option>
                  <option value="educational">تعليمي</option>
                  <option value="health">صحي</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">الموعد المستهدف</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={handleAddGoal} className="flex-1 btn-primary">
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

export default Goals
