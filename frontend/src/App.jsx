import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SwotAnalysis from './pages/SwotAnalysis'
import DailyTasks from './pages/DailyTasks'
import Calendar from './pages/Calendar'
import Goals from './pages/Goals'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import ChatTimeMind from './pages/ChatTimeMind'
import Layout from './components/Layout'

// Theme Context
export const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">جاري التحميل...</p>
          </div>
        </div>
      )
    }
    return isAuthenticated ? children : <Navigate to="/login" />
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout user={user} setIsAuthenticated={setIsAuthenticated}>
                <Dashboard user={user} />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout user={user} setIsAuthenticated={setIsAuthenticated}>
                <Dashboard user={user} />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/swot" element={
            <ProtectedRoute>
              <Layout user={user} setIsAuthenticated={setIsAuthenticated}>
                <SwotAnalysis user={user} />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/daily-tasks" element={
            <ProtectedRoute>
              <Layout user={user} setIsAuthenticated={setIsAuthenticated}>
                <DailyTasks user={user} />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Layout user={user} setIsAuthenticated={setIsAuthenticated}>
                <Calendar user={user} />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/goals" element={
            <ProtectedRoute>
              <Layout user={user} setIsAuthenticated={setIsAuthenticated}>
                <Goals user={user} />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout user={user} setIsAuthenticated={setIsAuthenticated}>
                <Analytics user={user} />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Layout user={user} setIsAuthenticated={setIsAuthenticated}>
                <Notifications user={user} />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout user={user} setIsAuthenticated={setIsAuthenticated} setUser={setUser}>
                <Settings user={user} setUser={setUser} />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/chat" element={
            <ProtectedRoute>
              <Layout user={user} setIsAuthenticated={setIsAuthenticated}>
                <ChatTimeMind user={user} />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  )
}

export default App
