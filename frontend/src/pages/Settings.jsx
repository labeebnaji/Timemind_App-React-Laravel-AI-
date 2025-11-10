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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">الإعدادات ⚙️</h1>

      {/* Profile Settings */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">الملف الشخصي</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">الاسم الكامل</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">رقم الهاتف</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="input-field"
              placeholder="+966 5X XXX XXXX"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">المنطقة الزمنية</label>
            <select
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              className="input-field"
            >
              <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              <option value="Asia/Dubai">دبي (GMT+4)</option>
              <option value="Africa/Cairo">القاهرة (GMT+2)</option>
            </select>
          </div>

          <button onClick={handleSaveProfile} className="btn-primary">
            حفظ التغييرات
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">تفضيلات الإشعارات</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">إشعارات البريد الإلكتروني</p>
              <p className="text-sm text-gray-600">تلقي الإشعارات عبر البريد</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">الإشعارات الفورية</p>
              <p className="text-sm text-gray-600">تلقي إشعارات فورية على المتصفح</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">تذكير بالمهام</p>
              <p className="text-sm text-gray-600">تذكير قبل موعد المهمة</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.taskReminders}
                onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">ملخص يومي</p>
              <p className="text-sm text-gray-600">ملخص المهام في نهاية اليوم</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.dailySummary}
                onChange={(e) => setNotifications({ ...notifications, dailySummary: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <button onClick={handleSaveNotifications} className="btn-primary">
            حفظ الإعدادات
          </button>
        </div>
      </div>

      {/* AI Settings */}
      <div className="card bg-gradient-to-br from-purple-50 to-indigo-50">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🤖</span> إعدادات الذكاء الاصطناعي
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div>
              <p className="font-semibold">التحليل التلقائي</p>
              <p className="text-sm text-gray-600">تحليل المهام تلقائياً عند إضافتها</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiSettings.autoAnalyze}
                onChange={(e) => setAiSettings({ ...aiSettings, autoAnalyze: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="p-4 bg-white rounded-lg">
            <label className="block font-semibold mb-2">تكرار الاقتراحات</label>
            <select
              value={aiSettings.suggestionFrequency}
              onChange={(e) => setAiSettings({ ...aiSettings, suggestionFrequency: e.target.value })}
              className="input-field"
            >
              <option value="realtime">فوري</option>
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
            </select>
          </div>

          <div className="p-4 bg-white rounded-lg">
            <label className="block font-semibold mb-2">عمق التحليل</label>
            <select
              value={aiSettings.analysisDepth}
              onChange={(e) => setAiSettings({ ...aiSettings, analysisDepth: e.target.value })}
              className="input-field"
            >
              <option value="basic">أساسي</option>
              <option value="detailed">تفصيلي</option>
              <option value="comprehensive">شامل</option>
            </select>
          </div>

          <button onClick={handleSaveAI} className="btn-primary">
            حفظ الإعدادات
          </button>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">تخصيص المظهر</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-6 rounded-lg border-2 transition-all ${
              theme === 'light' ? 'border-primary bg-blue-50' : 'border-gray-200'
            }`}
          >
            <span className="text-4xl block mb-2">☀️</span>
            <span className="font-semibold">وضع النهار</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-6 rounded-lg border-2 transition-all ${
              theme === 'dark' ? 'border-primary bg-blue-50' : 'border-gray-200'
            }`}
          >
            <span className="text-4xl block mb-2">🌙</span>
            <span className="font-semibold">وضع الليل</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-2 border-danger">
        <h2 className="text-xl font-bold mb-4 text-danger">منطقة الخطر</h2>
        <div className="space-y-4">
          <button className="w-full bg-red-50 text-danger px-6 py-3 rounded-lg hover:bg-red-100 font-semibold">
            حذف جميع المهام
          </button>
          <button className="w-full bg-red-50 text-danger px-6 py-3 rounded-lg hover:bg-red-100 font-semibold">
            إعادة تعيين الإعدادات
          </button>
          <button className="w-full bg-danger text-white px-6 py-3 rounded-lg hover:bg-red-600 font-semibold">
            حذف الحساب نهائياً
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
