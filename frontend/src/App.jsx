import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SwotAnalysis from './pages/SwotAnalysis'
import DailyTasks from './pages/DailyTasks'
import Calendar from './pages/Calendar'
import Goals from './pages/Goals'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Layout from './components/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      )
    }
    return isAuthenticated ? children : <Navigate to="/login" />
  }

  return (
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
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout user={user} setIsAuthenticated={setIsAuthenticated}>
              <Settings user={user} />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
