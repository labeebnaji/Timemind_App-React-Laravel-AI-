import { useState } from 'react'
import { useTheme } from '../App'
import { settingsAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

const Settings = ({ user, setUser }) => {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      showMessage('error', 'الاسم مطلوب')
      return
    }
    setSaving(true)
    try {
      await settingsAPI.updateProfile(profile)
      const updatedUser = { ...user, name: profile.name }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      if (setUser) setUser(updatedUser)
      showMessage('success', 'تم حفظ الملف الشخصي بنجاح! ✅')
    } catch (error) {
      showMessage('error', 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAllTasks = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع المهام؟ لا يمكن التراجع عن هذا الإجراء!')) return
    try {
      await settingsAPI.deleteAllTasks()
      showMessage('success', 'تم حذف جميع المهام بنجاح')
    } catch (error) {
      showMessage('error', 'حدث خطأ أثناء حذف المهام')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmText = prompt('اكتب "حذف حسابي" للتأكيد:')
    if (confirmText !== 'حذف حسابي') {
      showMessage('error', 'لم يتم تأكيد الحذف')
      return
    }
    try {
      await settingsAPI.deleteAccount()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    } catch (error) {
      showMessage('error', 'حدث خطأ أثناء حذف الحساب')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">الإعدادات ⚙️</h1>

      {/* Message Toast */}
      {message.text && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <div className="card !p-4 sm:!p-6 md:!p-8">
        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">الملف الشخصي</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">الاسم الكامل</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="input-field !py-2.5 sm:!py-4 !text-sm sm:!text-base"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">البريد الإلكتروني</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="input-field !py-2.5 sm:!py-4 !text-sm sm:!text-base bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
          </div>

          <button 
            onClick={handleSaveProfile} 
            disabled={saving}
            className="btn-primary w-full sm:w-auto text-sm sm:text-base !py-2.5 sm:!py-3.5 disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="card !p-4 sm:!p-6 md:!p-8">
        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">تخصيص المظهر</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 sm:p-6 rounded-lg border-2 transition-all ${
              theme === 'light' ? 'border-primary bg-blue-50' : 'border-gray-200'
            }`}
          >
            <span className="text-2xl sm:text-4xl block mb-1 sm:mb-2">☀️</span>
            <span className="font-semibold text-xs sm:text-base">وضع النهار</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 sm:p-6 rounded-lg border-2 transition-all ${
              theme === 'dark' ? 'border-primary bg-blue-50' : 'border-gray-200'
            }`}
          >
            <span className="text-2xl sm:text-4xl block mb-1 sm:mb-2">🌙</span>
            <span className="font-semibold text-xs sm:text-base">وضع الليل</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card !p-4 sm:!p-6 md:!p-8 border-2 border-danger">
        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-danger">منطقة الخطر</h2>
        <div className="space-y-3 sm:space-y-4">
          <button 
            onClick={handleDeleteAllTasks}
            className="w-full bg-red-50 text-danger px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red-100 font-semibold text-sm sm:text-base"
          >
            حذف جميع المهام
          </button>
          <button 
            onClick={handleDeleteAccount}
            className="w-full bg-danger text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red-600 font-semibold text-sm sm:text-base"
          >
            حذف الحساب نهائياً
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
