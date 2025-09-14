import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:3001'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      validateToken()
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async () => {
    try {
      const response = await axios.get('/api/user/stats')
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      showToast('Welcome back!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      showToast(message, 'error')
      return { success: false, message }
    }
  }

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      showToast('Account created successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed'
      showToast(message, 'error')
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    showToast('Logged out successfully')
  }

  const value = {
    user,
    loading,
    toast,
    login,
    signup,
    logout,
    showToast,
    setUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
