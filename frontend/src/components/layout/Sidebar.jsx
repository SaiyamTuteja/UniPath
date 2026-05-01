import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useState, useEffect } from 'react'
import api from '../../api/axios'

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: '🏠', desc: 'Dashboard' },
  { path: '/map', label: 'Campus Map', icon: '🗺️', desc: 'Navigate campus' },
  { path: '/events', label: 'Events', icon: '📅', desc: 'Campus activities' },
  { path: '/lost-found', label: 'Lost & Found', icon: '🔍', desc: 'Report items' },
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/crowd/home-stats')
      .then(res => {
        // api module already unwraps response.data, so res = {success, data}
        if (res?.success && res?.data) {
          setStats(res.data)
        } else if (res?.data) {
          setStats(res.data)
        } else {
          setStats(res)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay"
          onClick={onClose}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:299, display:'none' }}
        />
      )}

      <aside className="sidebar-panel"
        style={{
          position:'fixed', top:64, left:0, bottom:0, width:260,
          background:'var(--sidebar-bg)', backdropFilter:'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          borderRight:'1px solid var(--border-default)', zIndex:300,
          display:'flex', flexDirection:'column', transition:'background 0.3s, transform 0.3s ease',
          overflowY:'auto', overflowX:'hidden',
          transform: isOpen ? 'translateX(0)' : 'translateX(-280px)',
        }}
      >
        <div style={{ padding:'20px 14px', flex:1 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1.5, padding:'0 10px', marginBottom:10 }}>
            Navigation
          </div>
          <nav style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path
              return (
                <Link key={item.path} to={item.path} onClick={onClose} style={{
                  textDecoration:'none', padding:'10px 12px', borderRadius:12,
                  display:'flex', alignItems:'center', gap:12,
                  background: active ? 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(6,182,212,0.08))' : 'transparent',
                  border: active ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                  transition:'all 0.2s',
                }}>
                  <span style={{ fontSize:18 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:active?700:500, color:active?'var(--accent-blue)':'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </Link>
              )
            })}
            {user?.role && ['admin','faculty','staff'].includes(user.role) && (
              <Link to="/admin" onClick={onClose} style={{
                textDecoration:'none', padding:'10px 12px', borderRadius:12,
                display:'flex', alignItems:'center', gap:12, marginTop:4,
                background: location.pathname==='/admin' ? 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))' : 'transparent',
                border: location.pathname==='/admin' ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
              }}>
                <span style={{ fontSize:18 }}>🛡️</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:location.pathname==='/admin'?700:500, color:location.pathname==='/admin'?'#F59E0B':'var(--text-primary)' }}>Admin Panel</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)' }}>Manage campus</div>
                </div>
              </Link>
            )}
          </nav>

          <div style={{ marginTop:28 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1.5, padding:'0 10px', marginBottom:10 }}>
              Quick Stats
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, padding:'0 4px' }}>
              {[
                { label:'Upcoming Events', val:stats?.upcomingEvents ?? '—', color:'#14B8A6', icon:'📅' },
                { label:'Lost Items', val:stats?.openLostItems ?? '—', color:'#EF4444', icon:'🔴' },
                { label:'Found Items', val:stats?.openFoundItems ?? '—', color:'#10B981', icon:'🟢' },
                { label:'Campus Users', val:stats?.totalUsers ?? '—', color:'#3B82F6', icon:'👥' },
              ].map(s => (
                <div key={s.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:`${s.color}08`, border:`1px solid ${s.color}18` }}>
                  <span style={{ fontSize:16 }}>{s.icon}</span>
                  <div style={{ flex:1, fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
                  <div style={{ fontSize:16, fontWeight:900, color:s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding:'16px 14px', borderTop:'1px solid var(--border-default)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, background:'var(--input-bg)', border:'1px solid var(--border-default)' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#3B82F6,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, fontWeight:800, flexShrink:0 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]||''}
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'capitalize' }}>
                {user?.role||'student'} • {user?.course||'GEHU'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
