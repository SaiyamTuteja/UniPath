// ProfilePanel.jsx — Premium redesigned profile panel with navigation links
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'

export default function ProfilePanel({ onClose }) {
  const { user, logout, isGuest, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    course: user?.course || '',
    semester: user?.semester || '',
    section: user?.section || '',
  })
  const [saving, setSaving] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    onClose()
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(form)
      setEditing(false)
    } catch {} finally {
      setSaving(false)
    }
  }

  const initials = isGuest
    ? '👤'
    : `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?'

  const navLinks = [
    { to: '/map', icon: '🗺️', label: 'Campus Map', desc: 'Navigate rooms & paths' },
    { to: '/events', icon: '📅', label: 'Events', desc: 'Upcoming campus events' },
    { to: '/lost-found', icon: '🔍', label: 'Lost & Found', desc: 'Report or find lost items' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 24, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        top: 56,
        right: 12,
        zIndex: 2000,
        width: 300,
        background: 'linear-gradient(145deg, rgba(10,22,40,0.98), rgba(7,15,30,0.99))',
        border: '1px solid rgba(20,184,166,0.2)',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(20,184,166,0.08)',
      }}
    >
      {/* Top gradient accent */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #14b8a6, #3b82f6, #a855f7)' }} />

      {/* User header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: isGuest ? 'linear-gradient(135deg, #374151, #4b5563)' : 'linear-gradient(135deg, #0d9488, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isGuest ? 22 : 18, fontWeight: 900, color: 'white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            border: '2px solid rgba(255,255,255,0.1)',
          }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isGuest ? 'Guest User' : `${user?.firstName || ''} ${user?.lastName || ''}`}
            </p>
            <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isGuest ? 'Limited access' : user?.email}
            </p>
          </div>

          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ✕
          </button>
        </div>

        {/* Role badge */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
            background: isGuest ? 'rgba(100,116,139,0.15)' : 'rgba(13,148,136,0.15)',
            color: isGuest ? '#94a3b8' : '#5eead4',
            border: `1px solid ${isGuest ? 'rgba(100,116,139,0.25)' : 'rgba(13,148,136,0.35)'}`,
          }}>
            {isGuest ? '⬜ GUEST' : `✅ ${(user?.role || 'STUDENT').toUpperCase()}`}
          </span>
          {!isGuest && user?.course && (
            <span style={{ fontSize: 11, color: '#475569' }}>
              {user.course} · Sem {user.semester} · {user.section}
            </span>
          )}
        </div>
      </div>

      {/* Navigation shortcuts */}
      <div style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: 1, margin: '0 8px 6px', textTransform: 'uppercase' }}>Navigation</p>
        {navLinks.map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} onClick={onClose}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s', marginBottom: 2 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 18, width: 32, height: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{label}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Academic info edit (for logged-in users) */}
      {!isGuest && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <AnimatePresence mode="wait">
            {!editing ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {user?.course || 'No academic info'}{user?.semester ? ` · Sem ${user.semester} · ${user.section}` : ''}
                </span>
                <button onClick={() => setEditing(true)}
                  style={{ fontSize: 11, color: '#5eead4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  Edit
                </button>
              </motion.div>
            ) : (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { key: 'course', placeholder: 'Course (B.Tech CSE)', type: 'text' },
                ].map(({ key, placeholder, type }) => (
                  <input key={key} type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} className="input-field" style={{ fontSize: 12, padding: '8px 12px' }} />
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input type="number" value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
                    placeholder="Sem" className="input-field" style={{ fontSize: 12, padding: '8px 12px' }} min={1} max={8} />
                  <input type="text" value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value.toUpperCase() }))}
                    placeholder="Section" className="input-field" style={{ fontSize: 12, padding: '8px 12px' }} maxLength={2} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '7px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '7px', borderRadius: 8, background: 'linear-gradient(135deg, #0d9488, #2563eb)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {saving ? '...' : 'Save'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom actions */}
      <div style={{ padding: '10px 8px' }}>
        {isGuest ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onClick={() => {
                logout()
                setTimeout(() => { navigate('/login'); onClose() }, 50)
              }}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                background: 'linear-gradient(135deg, #0d9488, #2563eb)',
                border: 'none', color: 'white', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign In
            </button>
            <button
              onClick={() => {
                logout()
                setTimeout(() => { navigate('/register'); onClose() }, 50)
              }}
              style={{
                width: '100%', padding: '9px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              ✨ Create Account
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Admin panel shortcut */}
            {(user?.role === 'admin' || user?.role === 'faculty' || user?.role === 'staff') && (
              <Link to="/admin" onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '9px', borderRadius: 10, textDecoration: 'none',
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                  color: '#fbbf24', fontSize: 13, fontWeight: 700,
                }}>
                🛡️ Admin Panel
              </Link>
            )}
            <button onClick={handleLogout}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log Out
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
