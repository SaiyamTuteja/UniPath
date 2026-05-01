import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

const LIGHT_VARS = {
  '--bg-primary': '#F8FAFC',
  '--bg-secondary': '#F1F5F9',
  '--bg-card': 'rgba(255, 255, 255, 0.85)',
  '--bg-card-solid': '#FFFFFF',
  '--border-glow': 'rgba(59, 130, 246, 0.15)',
  '--border-default': 'rgba(15, 23, 42, 0.08)',
  '--text-primary': '#0F172A',
  '--text-secondary': '#475569',
  '--text-muted': '#94A3B8',
  '--accent-blue': '#3B82F6',
  '--accent-cyan': '#06B6D4',
  '--accent-teal': '#14B8A6',
  '--accent-purple': '#8B5CF6',
  '--sidebar-bg': 'rgba(255, 255, 255, 0.92)',
  '--header-bg': 'rgba(248, 250, 252, 0.88)',
  '--footer-bg': '#0F172A',
  '--input-bg': 'rgba(15, 23, 42, 0.04)',
  '--input-border': 'rgba(15, 23, 42, 0.12)',
  '--hover-bg': 'rgba(59, 130, 246, 0.06)',
  '--shadow-color': 'rgba(15, 23, 42, 0.08)',
}

const DARK_VARS = {
  '--bg-primary': '#0A0F1E',
  '--bg-secondary': '#0D1529',
  '--bg-card': 'rgba(13, 21, 41, 0.8)',
  '--bg-card-solid': '#111827',
  '--border-glow': 'rgba(59, 130, 246, 0.3)',
  '--border-default': 'rgba(255, 255, 255, 0.08)',
  '--text-primary': '#F9FAFB',
  '--text-secondary': '#9CA3AF',
  '--text-muted': '#6B7280',
  '--accent-blue': '#3B82F6',
  '--accent-cyan': '#06B6D4',
  '--accent-teal': '#14B8A6',
  '--accent-purple': '#8B5CF6',
  '--sidebar-bg': 'rgba(10, 15, 30, 0.95)',
  '--header-bg': 'rgba(10, 15, 30, 0.88)',
  '--footer-bg': '#060912',
  '--input-bg': 'rgba(255, 255, 255, 0.05)',
  '--input-border': 'rgba(255, 255, 255, 0.1)',
  '--hover-bg': 'rgba(59, 130, 246, 0.1)',
  '--shadow-color': 'rgba(0, 0, 0, 0.3)',
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('unipath_theme') || 'dark'
    } catch {
      return 'dark'
    }
  })

  const applyTheme = useCallback((t) => {
    const root = document.documentElement
    const vars = t === 'dark' ? DARK_VARS : LIGHT_VARS

    if (t === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [])

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem('unipath_theme', theme)
    } catch {}
  }, [theme, applyTheme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default ThemeContext
