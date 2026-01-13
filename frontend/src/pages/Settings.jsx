import { useState } from 'react'

const Settings = ({ user }) => {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    timezone: 'Asia/Riyadh'
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskReminders: true,
    dailySummary: true,
    weeklyReport: true,
    aiSuggestions: true
  })

  const [aiSettings, setAiSettings] = useState({
    autoAnalyze: true,
    suggestionFrequency: 'daily',
    analysisDepth: 'detailed'
  })

  const [theme, setTheme] = useState('light')

  const handleSaveProfile = () => {
    alert('تم حفظ الملف الشخصي بنجاح! ✅')
  }

  const handleSaveNotifications = () => {
    alert('تم حفظ إعدادات الإشعارات بنجاح! ✅')
  }

  const handleSaveAI = () => {
    alert('تم حفظ إعدادات الذكاء الاصطناعي بنجاح! ✅')
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">الإعدادات ⚙️</h1>

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
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="input-field !py-2.5 sm:!py-4 !text-sm sm:!text-base"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">رقم الهاتف</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="input-field !py-2.5 sm:!py-4 !text-sm sm:!text-base"
              placeholder="+966 5X XXX XXXX"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">المنطقة الزمنية</label>
            <select
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              className="input-field !py-2.5 sm:!py-4 !text-sm sm:!text-base"
            >
              <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              <option value="Asia/Dubai">دبي (GMT+4)</option>
              <option value="Africa/Cairo">القاهرة (GMT+2)</option>
            </select>
          </div>

          <button onClick={handleSaveProfile} className="btn-primary w-full sm:w-auto text-sm sm:text-base !py-2.5 sm:!py-3.5">
            حفظ التغييرات
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card !p-4 sm:!p-6 md:!p-8">
        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">تفضيلات الإشعارات</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">إشعارات البريد الإلكتروني</p>
              <p className="text-xs sm:text-sm text-gray-600">تلقي الإشعارات عبر البريد</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">الإشعارات الفورية</p>
              <p className="text-xs sm:text-sm text-gray-600">تلقي إشعارات فورية على المتصفح</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">تذكير بالمهام</p>
              <p className="text-xs sm:text-sm text-gray-600">تذكير قبل موعد المهمة</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifications.taskReminders}
                onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">ملخص يومي</p>
              <p className="text-xs sm:text-sm text-gray-600">ملخص المهام في نهاية اليوم</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifications.dailySummary}
                onChange={(e) => setNotifications({ ...notifications, dailySummary: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <button onClick={handleSaveNotifications} className="btn-primary w-full sm:w-auto text-sm sm:text-base !py-2.5 sm:!py-3.5">
            حفظ الإعدادات
          </button>
        </div>
      </div>

      {/* AI Settings */}
      <div className="card !p-4 sm:!p-6 md:!p-8 bg-gradient-to-br from-purple-50 to-indigo-50">
        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
          <span>🤖</span> إعدادات الذكاء الاصطناعي
        </h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">التحليل التلقائي</p>
              <p className="text-xs sm:text-sm text-gray-600">تحليل المهام تلقائياً عند إضافتها</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={aiSettings.autoAnalyze}
                onChange={(e) => setAiSettings({ ...aiSettings, autoAnalyze: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="p-3 sm:p-4 bg-white rounded-lg">
            <label className="block font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">تكرار الاقتراحات</label>
            <select
              value={aiSettings.suggestionFrequency}
              onChange={(e) => setAiSettings({ ...aiSettings, suggestionFrequency: e.target.value })}
              className="input-field !py-2.5 sm:!py-4 !text-sm sm:!text-base"
            >
              <option value="realtime">فوري</option>
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
            </select>
          </div>

          <div className="p-3 sm:p-4 bg-white rounded-lg">
            <label className="block font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">عمق التحليل</label>
            <select
              value={aiSettings.analysisDepth}
              onChange={(e) => setAiSettings({ ...aiSettings, analysisDepth: e.target.value })}
              className="input-field !py-2.5 sm:!py-4 !text-sm sm:!text-base"
            >
              <option value="basic">أساسي</option>
              <option value="detailed">تفصيلي</option>
              <option value="comprehensive">شامل</option>
            </select>
          </div>

          <button onClick={handleSaveAI} className="btn-primary w-full sm:w-auto text-sm sm:text-base !py-2.5 sm:!py-3.5">
            حفظ الإعدادات
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
          <button className="w-full bg-red-50 text-danger px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red-100 font-semibold text-sm sm:text-base">
            حذف جميع المهام
          </button>
          <button className="w-full bg-red-50 text-danger px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red-100 font-semibold text-sm sm:text-base">
            إعادة تعيين الإعدادات
          </button>
          <button className="w-full bg-danger text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red-600 font-semibold text-sm sm:text-base">
            حذف الحساب نهائياً
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings