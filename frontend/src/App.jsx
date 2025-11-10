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

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  const ProtectedRoute = ({ children }) => {
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
