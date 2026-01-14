import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../services/api'

// Create notification context for global access
export const NotificationContext = createContext()

export const useNotifications = () => useContext(NotificationContext)

const Layout = ({ children, user, setIsAuthenticated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasUrgent, setHasUrgent] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [shouldShake, setShouldShake] = useState(false)
  const notificationRef = useRef(null)
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

  // Load notifications
  useEffect(() => {
    loadNotifications()
    generateReminders()
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadNotifications()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Shake animation every 5 minutes if unread
  useEffect(() => {
    if (unreadCount > 0) {
      setShouldShake(true)
      const timeout = setTimeout(() => setShouldShake(false), 1000)
      
      const shakeInterval = setInterval(() => {
        setShouldShake(true)
        setTimeout(() => setShouldShake(false), 1000)
      }, 300000)
      
      return () => {
        clearTimeout(timeout)
        clearInterval(shakeInterval)
      }
    }
  }, [unreadCount])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
        setSelectedNotification(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getUnread()
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.count || 0)
      setHasUrgent(response.data.has_urgent || false)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const generateReminders = async () => {
    try {
      await notificationsAPI.generateReminders()
    } catch (error) {
      console.error('Error generating reminders:', error)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      loadNotifications()
      setSelectedNotification(null)
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Auto mark as read when opening notification
  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification)
    // Auto mark as read
    if (!notification.is_read) {
      try {
        await notificationsAPI.markAsRead(notification.id)
        loadNotifications()
      } catch (error) {
        console.error('Error marking as read:', error)
      }
    }
  }

  // Navigate to task
  const handleGoToTask = (taskId) => {
    setShowNotifications(false)
    setSelectedNotification(null)
    navigate('/daily-tasks')
  }

  // Refresh notifications (exposed for other components)
  const refreshNotifications = () => {
    loadNotifications()
  }

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

  // Color based on notification type (simple colored line)
  const getTypeColor = (type, priority) => {
    if (type === 'task_due_today') return 'border-r-red-500'
    if (type === 'task_due_tomorrow' || type === 'task_high_tomorrow') return 'border-r-orange-500'
    if (type === 'task_reminder_2days') return 'border-r-yellow-500'
    if (type === 'task_created') return 'border-r-green-500'
    if (type === 'welcome') return 'border-r-purple-500'
    // Fallback to priority
    if (priority === 'high') return 'border-r-red-500'
    if (priority === 'medium') return 'border-r-yellow-500'
    return 'border-r-blue-500'
  }

  return (
    <NotificationContext.Provider value={{ refreshNotifications }}>
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
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`
                      relative p-2 rounded-full transition-all
                      ${hasUrgent ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}
                      ${shouldShake ? 'animate-shake' : ''}
                    `}
                  >
                    <span className="text-xl">🔔</span>
                    {unreadCount > 0 && (
                      <span className={`
                        absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center
                        text-xs font-bold text-white rounded-full px-1
                        ${hasUrgent ? 'bg-red-600' : 'bg-blue-600'}
                      `}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                      {selectedNotification ? (
                        // Notification Detail View - Fixed height
                        <div className="h-64">
                          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                            <button 
                              onClick={() => setSelectedNotification(null)}
                              className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                              ← رجوع
                            </button>
                            {selectedNotification.task_id && (
                              <button
                                onClick={() => handleGoToTask(selectedNotification.task_id)}
                                className="text-blue-600 text-sm font-medium"
                              >
                                الذهاب للمهمة →
                              </button>
                            )}
                          </div>
                          <div className={`p-4 h-52 overflow-y-auto border-r-4 ${getTypeColor(selectedNotification.type, selectedNotification.priority)}`}>
                            <h3 className="font-bold text-base mb-2">{selectedNotification.title}</h3>
                            <p className="text-gray-600 text-sm">{selectedNotification.message}</p>
                            {selectedNotification.is_urgent && (
                              <span className="inline-block mt-3 px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                عاجل - ينتهي اليوم!
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Notifications List
                        <>
                          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold">الإشعارات</h3>
                            <Link 
                              to="/notifications" 
                              onClick={() => setShowNotifications(false)}
                              className="text-blue-600 text-sm"
                            >
                              عرض الكل
                            </Link>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.slice(0, 5).map(notification => (
                                <div
                                  key={notification.id}
                                  onClick={() => handleNotificationClick(notification)}
                                  className={`
                                    p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors
                                    border-r-4 ${getTypeColor(notification.type, notification.priority)}
                                    ${notification.is_urgent ? 'bg-red-50' : ''}
                                  `}
                                >
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                                    <p className="text-gray-500 text-xs truncate mt-1">{notification.message}</p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-6 text-center text-gray-500">
                                <p className="text-sm">لا توجد إشعارات جديدة</p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
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
                
                {/* Logout (Desktop) - Icon only */}
                <button 
                  onClick={handleLogout} 
                  className="hidden sm:flex items-center justify-center text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors"
                  title="تسجيل الخروج"
                >
                  <span className="text-xl">🚪</span>
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

        {/* Shake Animation Style */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px) rotate(-5deg); }
            75% { transform: translateX(3px) rotate(5deg); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
      </div>
    </NotificationContext.Provider>
  )
}

export default Layout
