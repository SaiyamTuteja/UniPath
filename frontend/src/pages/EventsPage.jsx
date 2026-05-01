// EventsPage.jsx — Upcoming campus events with create modal
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const TAG_OPTIONS = ['Tech', 'Cultural', 'Sports', 'Seminar', 'Workshop', 'Fest', 'Academic', 'Other']
const TAG_COLORS = {
  Tech: '#3b82f6', Cultural: '#a855f7', Sports: '#f59e0b', Seminar: '#10b981',
  Workshop: '#06b6d4', Fest: '#ef4444', Academic: '#8b5cf6', Other: '#6b7280',
}

function EventCard({ event, onDelete, isOwner }) {
  const d = new Date(event.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isPast = d < today
  const month = d.toLocaleString('default', { month: 'short' }).toUpperCase()
  const day = d.getDate()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isPast ? 'var(--border-default)' : 'rgba(20,184,166,0.25)'}`,
        borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'default',
        opacity: isPast ? 0.7 : 1,
      }}
    >
      {!isPast && (
        <div style={{ height: 3, background: 'linear-gradient(90deg, #14b8a6, #3b82f6, #a855f7)' }} />
      )}
      {event.image && (
        <div style={{ height: 140, overflow: 'hidden' }}>
          <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{
            minWidth: 48, textAlign: 'center',
            background: isPast ? 'rgba(100,116,139,0.1)' : 'rgba(20,184,166,0.1)',
            borderRadius: 10, padding: '6px 8px',
            border: `1px solid ${isPast ? 'rgba(100,116,139,0.2)' : 'rgba(20,184,166,0.3)'}`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: isPast ? '#94a3b8' : '#5eead4', letterSpacing: 1 }}>{month}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{day}</div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>{event.title}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {(event.tags || []).slice(0, 3).map(tag => (
                <span key={tag} style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: `${TAG_COLORS[tag] || '#6b7280'}22`,
                  color: TAG_COLORS[tag] || '#94a3b8',
                  border: `1px solid ${TAG_COLORS[tag] || '#6b7280'}44`,
                }}>{tag}</span>
              ))}
              {isPast && <span style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 20, background: 'var(--input-bg)' }}>Past</span>}
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🕐</span> {event.time} &nbsp;·&nbsp; <span>📍</span> {event.venue}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>👤</span> {event.organizer}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {event.registrationLink && !isPast && (
            <a href={event.registrationLink} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, textAlign: 'center', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: 'linear-gradient(135deg, #0d9488, #0891b2)', color: 'white', textDecoration: 'none',
              }}>
              Register →
            </a>
          )}
          {isOwner && (
            <button onClick={() => onDelete(event._id)} style={{
              padding: '8px 12px', borderRadius: 8, fontSize: 12, background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', fontWeight: 600,
            }}>
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CreateEventModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', venue: '', organizer: '',
    tags: [], registrationLink: '', image: '',
  })
  const [loading, setLoading] = useState(false)

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB')
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, image: reader.result }))
    reader.readAsDataURL(file)
  }

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.date || !form.time || !form.venue || !form.organizer) {
      return toast.error('Please fill all required fields')
    }
    setLoading(true)
    try {
      const data = await api.post('/events', form)
      toast.success('Event created! 🎉')
      onCreated(data.data || data)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{
          background: 'var(--bg-card-solid)', border: '1px solid rgba(20,184,166,0.3)',
          borderRadius: 20, padding: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>📅 Create Event</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Event Title *', key: 'title', placeholder: 'Annual Tech Fest 2025' },
            { label: 'Venue *', key: 'venue', placeholder: 'Main Auditorium' },
            { label: 'Organizer *', key: 'organizer', placeholder: 'CSE Department' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{label}</label>
              <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={inputStyle} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Time *</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TAG_OPTIONS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    background: form.tags.includes(tag) ? `${TAG_COLORS[tag]}33` : 'var(--input-bg)',
                    border: `1px solid ${form.tags.includes(tag) ? TAG_COLORS[tag] : 'var(--border-default)'}`,
                    color: form.tags.includes(tag) ? TAG_COLORS[tag] : 'var(--text-muted)',
                  }}>{tag}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Registration Link (optional)</label>
            <input value={form.registrationLink} onChange={e => setForm(f => ({ ...f, registrationLink: e.target.value }))} placeholder="https://forms.google.com/..." style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Event Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImage} style={{ fontSize: 12, color: 'var(--text-secondary)', width: '100%' }} />
            {form.image && <img src={form.image} alt="preview" style={{ marginTop: 8, width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />}
          </div>
          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#374151' : 'linear-gradient(135deg, #0d9488, #0891b2)',
              color: 'white', fontSize: 14, fontWeight: 700, marginTop: 4,
            }}>
            {loading ? '⏳ Publishing...' : '🎉 Publish Event'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function EventsPage() {
  const { isAuthenticated, isGuest, user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('upcoming')
  const [searchTag, setSearchTag] = useState('')

  const fetchEvents = useCallback(async () => {
    try {
      const params = filter === 'upcoming' ? '?upcoming=true' : ''
      const data = await api.get(`/events${params}`)
      setEvents(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, 30000)
    return () => clearInterval(interval)
  }, [fetchEvents])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try {
      await api.delete(`/events/${id}`)
      setEvents(ev => ev.filter(e => e._id !== id))
      toast.success('Event deleted')
    } catch {
      toast.error('Could not delete')
    }
  }

  const filtered = events.filter(e => !searchTag || (e.tags || []).includes(searchTag))

  return (
    <div style={{ padding: '24px 28px 40px', fontFamily: 'Inter, sans-serif', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Hero banner */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(13,148,136,0.12), rgba(8,145,178,0.08))',
          border: '1px solid var(--border-default)', borderRadius: 20, padding: '24px 28px', marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 48 }}>🎓</div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>What's Happening at GEHU</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>Stay updated with campus events, workshops, fests, and seminars</p>
          </div>
        </div>
        {!isGuest && isAuthenticated && (
          <button onClick={() => setShowCreate(true)} style={{
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #0d9488, #0891b2)', color: 'white',
            fontSize: 13, fontWeight: 700, boxShadow: '0 4px 15px rgba(13,148,136,0.3)',
          }}>+ Create Event</button>
        )}
      </motion.div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {['upcoming', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: filter === f ? 'rgba(20,184,166,0.15)' : 'var(--input-bg)',
            border: `1px solid ${filter === f ? 'rgba(20,184,166,0.4)' : 'var(--border-default)'}`,
            color: filter === f ? '#14B8A6' : 'var(--text-muted)',
          }}>
            {f === 'upcoming' ? '🔜 Upcoming' : '📋 All Events'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setSearchTag('')} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
            background: !searchTag ? 'rgba(20,184,166,0.15)' : 'var(--input-bg)',
            border: `1px solid ${!searchTag ? 'rgba(20,184,166,0.4)' : 'var(--border-default)'}`,
            color: !searchTag ? '#14B8A6' : 'var(--text-muted)',
          }}>All Tags</button>
          {TAG_OPTIONS.slice(0, 5).map(tag => (
            <button key={tag} onClick={() => setSearchTag(searchTag === tag ? '' : tag)} style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
              background: searchTag === tag ? `${TAG_COLORS[tag]}22` : 'var(--input-bg)',
              border: `1px solid ${searchTag === tag ? TAG_COLORS[tag] : 'var(--border-default)'}`,
              color: searchTag === tag ? TAG_COLORS[tag] : 'var(--text-muted)',
            }}>{tag}</button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(20,184,166,0.2)', borderTop: '3px solid #14b8a6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          Loading events...
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📭</div>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 8 }}>No events found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {isAuthenticated && !isGuest ? 'Be the first to create an event!' : 'Check back soon.'}
          </p>
        </motion.div>
      ) : (
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          <AnimatePresence>
            {filtered.map(event => (
              <EventCard key={event._id} event={event} onDelete={handleDelete}
                isOwner={user && (String(event.createdBy) === String(user._id) || user.role === 'admin')} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onCreated={e => setEvents(prev => [e, ...prev])} />}
      </AnimatePresence>
    </div>
  )
}
