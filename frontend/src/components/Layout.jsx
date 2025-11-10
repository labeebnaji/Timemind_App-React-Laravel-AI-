import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Layout = ({ children, user, setIsAuthenticated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'لوحة التحكم' },
    { path: '/swot', icon: '🧠', label: 'تحليل SWOT' },
    { path: '/daily-tasks', icon: '✅', label: 'المهام اليومية' },
    { path: '/calendar', icon: '📅', label: 'التقويم' },
    { path: '/goals', icon: '🎯', label: 'الأهداف' },
    { path: '/analytics', icon: '📈', label: 'التقارير' },
    { path: '/settings', icon: '⚙️', label: 'الإعدادات' }
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full glass-effect shadow-2xl transition-all duration-300 z-40 border-l border-gray-200 ${
        sidebarOpen ? 'w-64 sm:w-72' : 'w-0 md:w-16 lg:w-20'
      } ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-3 sm:p-4 lg:p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            {sidebarOpen && <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">TimeMind AI</h1>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-xl sm:text-2xl p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          
          <nav className="space-y-1 sm:space-y-2">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                className={`flex items-center gap-2 sm:gap-3 lg:gap-4 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-xl sm:text-2xl flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="font-semibold text-sm sm:text-base">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'mr-0 md:mr-72' : 'mr-0 md:mr-20'}`}>
        {/* Header */}
        <header className="glass-effect shadow-lg sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="ابحث عن مهمة..."
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 w-full md:w-64 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <button className="relative p-2 hover:bg-blue-50 rounded-full transition-all">
                <span className="text-xl sm:text-2xl">🔔</span>
                <span className="absolute top-0 left-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-left">
                  <p className="font-bold text-sm lg:text-base">{user?.name || 'المستخدم'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.name?.charAt(0) || 'م'}
                </div>
              </div>
              
              <button onClick={handleLogout} className="text-red-600 hover:bg-red-50 px-3 sm:px-4 py-2 rounded-xl font-bold text-sm sm:text-base transition-all">
                خروج
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
