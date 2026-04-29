import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('unipath_token')
    const savedUser = localStorage.getItem('unipath_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('unipath_token')
        localStorage.removeItem('unipath_user')
      }
    }
    setLoading(false)
  }, [])

  const saveSession = useCallback((token, user) => {
    localStorage.setItem('unipath_token', token)
    localStorage.setItem('unipath_user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    saveSession(data.token, data.user)
    return data
  }, [saveSession])

  const register = useCallback(async (fields) => {
    const data = await api.post('/auth/register', fields)
    saveSession(data.token, data.user)
    return data
  }, [saveSession])

  const guestLogin = useCallback(async () => {
    const data = await api.post('/auth/guest')
    saveSession(data.token, data.user)
    return data
  }, [saveSession])

  const logout = useCallback(() => {
    localStorage.removeItem('unipath_token')
    localStorage.removeItem('unipath_user')
    // Clear cached map data
    localStorage.removeItem('mapData')
    localStorage.removeItem('mapsetsdate')
    localStorage.removeItem('hitcount')
    localStorage.removeItem('roomstatus_infocache')
    localStorage.removeItem('roomstatus_setdate')
    setToken(null)
    setUser(null)
    toast.success('Logged out')
  }, [])

  const updateProfile = useCallback(async (updates) => {
    const data = await api.put('/auth/me', updates)
    const updatedUser = data.user
    setUser(updatedUser)
    localStorage.setItem('unipath_user', JSON.stringify(updatedUser))
    return updatedUser
  }, [])

  const forgotPassword = useCallback(async (email) => {
    return api.post('/auth/forgot-password', { email })
  }, [])

  const resetPassword = useCallback(async (token, password) => {
    return api.post('/auth/reset-password', { token, password })
  }, [])

  const isAuthenticated = !loading && !!user
  const isGuest = user?.isGuest === true

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, isGuest,
      login, register, guestLogin, logout, updateProfile,
      forgotPassword, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
