import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Layout = ({ children, user, setIsAuthenticated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const closeSidebarOnMobile = () => {
    if (isMobile) setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 border-l border-gray-200
        ${sidebarOpen ? 'w-64 xs:w-72 translate-x-0' : 'w-0 translate-x-full md:w-16 md:translate-x-0'}
        overflow-hidden
      `}>
        <div className={`h-full flex flex-col ${sidebarOpen ? 'p-4' : 'p-2'}`}>
          {/* Logo */}
          <div className={`flex items-center mb-6 min-h-[40px] ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && (
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                TimeMind AI
              </h1>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block"
            >
              <span className="text-xl">{sidebarOpen ? '◀' : '▶'}</span>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebarOnMobile}
                title={!sidebarOpen ? item.label : ''}
                className={`
                  flex items-center rounded-xl transition-all duration-200
                  ${sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'}
                  ${location.pathname === item.path
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span className={`flex-shrink-0 ${sidebarOpen ? 'text-xl' : 'text-lg'}`}>{item.icon}</span>
                {sidebarOpen && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Info in Sidebar (Mobile) */}
          {sidebarOpen && isMobile && (
            <div className="pt-4 border-t border-gray-200 mt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'م'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{user?.name || 'المستخدم'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                🚪 تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen && !isMobile ? 'md:mr-64 lg:mr-72' : 'md:mr-16'}`}>
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-lg shadow-sm sticky top-0 z-30 border-b border-gray-100">
          <div className="px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">☰</span>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
              <input
                type="text"
                placeholder="ابحث..."
                className="w-full px-3 sm:px-4 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
              />
            </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              {/* User Info (Desktop) */}
              <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                <div className="text-left hidden lg:block">
                  <p className="font-bold text-sm">{user?.name || 'المستخدم'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.name?.charAt(0) || 'م'}
                </div>
              </div>
              
              {/* Logout (Desktop) */}
              <button 
                onClick={handleLogout} 
                className="hidden sm:block text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl font-bold text-sm transition-colors"
              >
                خروج
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
