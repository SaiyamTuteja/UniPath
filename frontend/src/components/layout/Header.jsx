import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: '🏠' },
  { path: '/map', label: 'Map', icon: '🗺️' },
  { path: '/events', label: 'Events', icon: '📅' },
  { path: '/lost-found', label: 'Lost & Found', icon: '🔍' },
]

export default function Header({ onToggleSidebar, sidebarOpen }) {
  const { user, logout, isGuest } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 200,
      background: 'var(--header-bg)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border-default)',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      {/* Left: Hamburger + Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hamburger for mobile */}
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          id="header-hamburger"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: 22,
            cursor: 'pointer',
            padding: 4,
            borderRadius: 8,
          }}
          className="header-hamburger"
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </motion.div>
        </button>

        {/* Logo */}
        <Link to="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0d9488, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(59, 130, 246, 0.3)',
          }}>
            <span style={{ fontSize: 18 }}>🧭</span>
          </div>
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #3B82F6, #06B6D4, #14B8A6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2,
            }}>
              UniPath
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}>
              GEHU Navigator
            </div>
          </div>
        </Link>
      </div>

      {/* Center: Navigation (desktop) */}
      <nav className="header-nav" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                background: isActive ? 'var(--hover-bg)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="header-active-indicator"
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    left: '20%',
                    right: '20%',
                    height: 2,
                    background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))',
                    borderRadius: 2,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Right: Theme toggle + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          aria-label="Toggle theme"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--input-bg)',
            border: '1px solid var(--border-default)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            transition: 'background 0.3s, border-color 0.3s',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={theme}
              initial={{ y: -20, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? '☀️' : '🌙'}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <motion.button
            onClick={() => setShowProfile(!showProfile)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            id="header-profile-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px 6px 6px',
              borderRadius: 12,
              background: 'var(--input-bg)',
              border: '1px solid var(--border-default)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 13,
              fontWeight: 800,
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0] || ''}
            </div>
            <div className="header-profile-name" style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              maxWidth: 100,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.firstName || 'User'}
            </div>
            <motion.span
              animate={{ rotate: showProfile ? 180 : 0 }}
              style={{ fontSize: 10, color: 'var(--text-muted)' }}
            >
              ▼
            </motion.span>
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  width: 220,
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 14,
                  padding: 8,
                  boxShadow: '0 12px 40px var(--shadow-color)',
                  zIndex: 999,
                }}
              >
                {/* User info */}
                <div style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--border-default)',
                  marginBottom: 4,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {user?.email}
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#3B82F6',
                    textTransform: 'uppercase',
                    marginTop: 4,
                    letterSpacing: 0.5,
                  }}>
                    {user?.role || 'student'}
                  </div>
                </div>

                {/* Menu items */}
                {user?.role && ['admin', 'faculty', 'staff'].includes(user.role) && (
                  <button
                    onClick={() => { setShowProfile(false); navigate('/admin') }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--hover-bg)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    🛡️ Admin Panel
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: '#EF4444',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  🚪 Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
