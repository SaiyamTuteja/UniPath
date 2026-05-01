import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../api/axios'

/* ────── Animated Counter ────── */
function AnimCounter({ target, duration = 1200 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (typeof target !== 'number') return
    let start = 0, startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <>{typeof target === 'number' ? count : '—'}</>
}

/* ────── Crowd Gauge ────── */
function CrowdGauge({ data }) {
  const densityMap = { low: { pct: 25, color: '#10B981', label: 'Low' }, medium: { pct: 55, color: '#F59E0B', label: 'Moderate' }, high: { pct: 80, color: '#EF4444', label: 'High' }, very_high: { pct: 95, color: '#DC2626', label: 'Very High' } }
  const info = densityMap[data?.density] || densityMap.low
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, #10B981, #F59E0B, #EF4444)`, position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '20px 20px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Crowd Estimate</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{data?.locationName || 'GEHU Campus'}</div>
        </div>
        <div style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: `${info.color}15`, color: info.color, fontWeight: 700, border: `1px solid ${info.color}30` }}>
          {data?.source === 'simulated' ? '⚡ Estimated' : '📡 Live'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 42, fontWeight: 900, color: info.color, lineHeight: 1 }}>
          ~{data?.estimatedCount || 0}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', paddingBottom: 6 }}>people</div>
      </div>
      {/* Gauge bar */}
      <div style={{ background: 'var(--input-bg)', borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: 10 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${info.pct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 8, background: `linear-gradient(90deg, #10B981, ${info.color})` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
        <span>Low</span><span>Moderate</span><span>High</span>
      </div>
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        ⚠️ Estimate based on time-of-day analysis
      </div>
    </motion.div>
  )
}

/* ────── Event Mini Card ────── */
function EventMiniCard({ event }) {
  const d = new Date(event.date)
  const isPast = d < new Date()
  return (
    <motion.div whileHover={{ y: -3, scale: 1.02 }} style={{
      minWidth: 260, background: 'var(--bg-card)', border: '1px solid var(--border-default)',
      borderRadius: 16, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.2s',
    }}>
      {!isPast && <div style={{ height: 3, background: 'linear-gradient(90deg, #14b8a6, #3b82f6, #a855f7)' }} />}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ minWidth: 42, textAlign: 'center', background: 'rgba(20,184,166,0.1)', borderRadius: 8, padding: '4px 6px', border: '1px solid rgba(20,184,166,0.2)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#5eead4', letterSpacing: 1 }}>{d.toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{d.getDate()}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🕐 {event.time} · 📍 {event.venue}</div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
          {event.description}
        </p>
      </div>
    </motion.div>
  )
}

/* ────── Lost/Found Mini Card ────── */
function LFMiniCard({ item }) {
  const isLost = item.type === 'lost'
  const c = isLost ? '#EF4444' : '#10B981'
  return (
    <motion.div whileHover={{ y: -2 }} style={{
      background: 'var(--bg-card)', border: `1px solid ${c}20`, borderRadius: 14, padding: 14, transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 800, background: `${c}15`, color: c, border: `1px solid ${c}30` }}>
          {isLost ? '🔴 LOST' : '🟢 FOUND'}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(item.dateLostFound).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {item.location}</div>
    </motion.div>
  )
}

/* ────── HOME PAGE ────── */
export default function HomePage() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [stats, setStats] = useState(null)
  const [events, setEvents] = useState([])
  const [lostFound, setLostFound] = useState([])
  const [crowd, setCrowd] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, eventsRes, lfRes, crowdRes] = await Promise.allSettled([
        api.get('/crowd/home-stats'),
        api.get('/events?upcoming=true'),
        api.get('/lost-found?status=open'),
        api.get('/crowd/estimate'),
      ])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || statsRes.value)
      if (eventsRes.status === 'fulfilled') setEvents((eventsRes.value.data || eventsRes.value || []).slice(0, 5))
      if (lfRes.status === 'fulfilled') setLostFound((lfRes.value.data || lfRes.value || []).slice(0, 4))
      if (crowdRes.status === 'fulfilled') setCrowd(crowdRes.value.data || crowdRes.value)
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const QUICK_ACTIONS = [
    { label: 'Navigate Campus', icon: '🗺️', path: '/map', gradient: 'linear-gradient(135deg, #0d9488, #0891b2)' },
    { label: 'View Events', icon: '📅', path: '/events', gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' },
    { label: 'Report Lost Item', icon: '🔴', path: '/lost-found', gradient: 'linear-gradient(135deg, #EF4444, #F97316)' },
    { label: 'Report Found', icon: '🟢', path: '/lost-found', gradient: 'linear-gradient(135deg, #10B981, #14B8A6)' },
  ]

  return (
    <div style={{ padding: '28px 28px 40px', fontFamily: 'Inter, sans-serif', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(13,148,136,0.12), rgba(59,130,246,0.08), rgba(139,92,246,0.06))'
            : 'linear-gradient(135deg, rgba(13,148,136,0.08), rgba(59,130,246,0.06), rgba(139,92,246,0.04))',
          border: '1px solid var(--border-default)', borderRadius: 24, padding: '32px 36px',
          marginBottom: 28, position: 'relative', overflow: 'hidden',
        }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(59,130,246,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(20,184,166,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>{greeting} 👋</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.2 }}>
            Welcome back, <span style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.firstName || 'Explorer'}</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, maxWidth: 500 }}>
            Navigate GEHU campus, explore events, and stay connected. Your smart campus companion.
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="home-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {QUICK_ACTIONS.map((a, i) => (
          <motion.div key={a.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={a.path} style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{
                  background: a.gradient, borderRadius: 16, padding: '20px 18px',
                  color: 'white', cursor: 'pointer', textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.label}</div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="home-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Events This Month', val: stats?.thisMonthEvents, icon: '📅', color: '#14B8A6' },
          { label: 'Upcoming Events', val: stats?.upcomingEvents, icon: '🔜', color: '#3B82F6' },
          { label: 'Lost Items Open', val: stats?.openLostItems, icon: '🔴', color: '#EF4444' },
          { label: 'Found Items Open', val: stats?.openFoundItems, icon: '🟢', color: '#10B981' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.06 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 16, padding: '20px 18px',
              position: 'relative', overflow: 'hidden',
            }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>
                  <AnimCounter target={s.val} />
                </div>
              </div>
              <div style={{ fontSize: 32, opacity: 0.6 }}>{s.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two column: Events + Crowd */}
      <div className="home-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Upcoming Events */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>📅 Upcoming Events</h2>
            <Link to="/events" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
          </div>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No upcoming events</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }} className="hide-scrollbar">
              {events.map(ev => <EventMiniCard key={ev._id} event={ev} />)}
            </div>
          )}
        </motion.div>

        {/* Crowd Gauge */}
        <CrowdGauge data={crowd} />
      </div>

      {/* Recent Lost & Found */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>🔍 Recent Lost & Found</h2>
          <Link to="/lost-found" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
        </div>
        {lostFound.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎁</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No open items</div>
          </div>
        ) : (
          <div className="home-lf-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {lostFound.map(item => <LFMiniCard key={item._id} item={item} />)}
          </div>
        )}
      </motion.div>
    </div>
  )
}
