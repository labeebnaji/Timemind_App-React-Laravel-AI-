import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../services/api'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll()
      setNotifications(response.data)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      loadNotifications()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      loadNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleGoToTask = (taskId) => {
    navigate('/daily-tasks')
  }

  const unreadNotifications = notifications.filter(n => !n.is_read)
  const readNotifications = notifications.filter(n => n.is_read)

  // Color based on notification type
  const getTypeColor = (type, priority) => {
    if (type === 'task_due_today') return 'border-r-red-500 bg-red-50'
    if (type === 'task_due_tomorrow' || type === 'task_high_tomorrow') return 'border-r-orange-500 bg-orange-50'
    if (type === 'task_reminder_2days') return 'border-r-yellow-500 bg-yellow-50'
    if (type === 'task_created') return 'border-r-green-500 bg-green-50'
    if (type === 'welcome') return 'border-r-purple-500 bg-purple-50'
    if (priority === 'high') return 'border-r-red-500 bg-red-50'
    if (priority === 'medium') return 'border-r-yellow-500 bg-yellow-50'
    return 'border-r-blue-500 bg-blue-50'
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'الآن'
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    if (days < 7) return `منذ ${days} يوم`
    return d.toLocaleDateString('ar-EG')
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">الإشعارات</h1>
        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 text-gray-800">غير مقروءة ({unreadNotifications.length})</h2>
          <div className="space-y-3">
            {unreadNotifications.map(notification => (
              <div
                key={notification.id}
                className={`card !p-4 border-r-4 transition-all ${getTypeColor(notification.type, notification.priority)} ${notification.is_urgent ? 'ring-2 ring-red-400' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm sm:text-base">{notification.title}</h3>
                      <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                    {notification.is_urgent && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                        عاجل
                      </span>
                    )}
                    <div className="flex gap-2 mt-3">
                      {notification.task_id && (
                        <button
                          onClick={() => handleGoToTask(notification.task_id)}
                          className="text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm"
                        >
                          الذهاب للمهمة
                        </button>
                      )}
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-lg text-sm"
                      >
                        تحديد كمقروء
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 text-gray-500">مقروءة ({readNotifications.length})</h2>
          <div className="space-y-3 opacity-60">
            {readNotifications.map(notification => (
              <div
                key={notification.id}
                className={`card !p-4 border-r-4 ${getTypeColor(notification.type, notification.priority)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm sm:text-base">{notification.title}</h3>
                      <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="card !p-8 text-center text-gray-500">
          <p>لا توجد إشعارات</p>
        </div>
      )}
    </div>
  )
}

export default Notifications
