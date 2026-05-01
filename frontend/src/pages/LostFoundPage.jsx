// LostFoundPage.jsx — Campus lost and found registry
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = ['all', 'electronics', 'clothing', 'stationery', 'accessories', 'documents', 'keys', 'bags', 'other']
const CATEGORY_EMOJI = {
  electronics: '💻', clothing: '👕', stationery: '📝', accessories: '💍',
  documents: '📄', keys: '🔑', bags: '🎒', other: '📦', all: '🔍',
}
const CAT_COLORS = {
  electronics: '#3b82f6', clothing: '#a855f7', stationery: '#f59e0b', accessories: '#ec4899',
  documents: '#10b981', keys: '#f97316', bags: '#06b6d4', other: '#6b7280',
}

function ItemCard({ item, onResolve }) {
  const [showContact, setShowContact] = useState(false)
  const isLost = item.type === 'lost'
  const catColor = CAT_COLORS[item.category] || '#6b7280'
  const d = new Date(item.dateLostFound)

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }} whileHover={{ y: -3 }}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isLost ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
        borderRadius: 16, overflow: 'hidden', position: 'relative',
        opacity: item.status === 'resolved' ? 0.6 : 1,
      }}>
      <div style={{ height: 3, background: isLost ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #10b981, #14b8a6)' }} />
      {item.image && (
        <div style={{ height: 130, overflow: 'hidden', position: 'relative' }}>
          <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))' }} />
        </div>
      )}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{
                padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: 1,
                background: isLost ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                color: isLost ? '#f87171' : '#34d399',
                border: `1px solid ${isLost ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
              }}>{isLost ? '🔴 LOST' : '🟢 FOUND'}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>{item.title}</h3>
          </div>
          <span style={{
            fontSize: 18, background: `${catColor}22`, width: 36, height: 36, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: `1px solid ${catColor}44`,
          }}>{CATEGORY_EMOJI[item.category] || '📦'}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </p>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>📍 {item.location}</div>
        {item.status === 'resolved' ? (
          <div style={{ textAlign: 'center', padding: '6px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, fontSize: 12, color: '#34d399', fontWeight: 700 }}>✅ Resolved</div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowContact(!showContact)} style={{
              flex: 1, padding: '8px', borderRadius: 8,
              border: `1px solid ${isLost ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
              background: isLost ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
              color: isLost ? '#f87171' : '#34d399', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>{showContact ? '▲ Hide' : '📞 Contact'}</button>
            <button onClick={() => onResolve(item._id)} style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-default)',
              background: 'var(--input-bg)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
            }}>Mark Resolved</button>
          </div>
        )}
        <AnimatePresence>
          {showContact && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--input-bg)', borderRadius: 8, fontSize: 12, borderLeft: `3px solid ${isLost ? '#f87171' : '#34d399'}` }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 3 }}>👤 {item.contactName}</div>
                <div style={{ color: '#60a5fa' }}>✉️ {item.contactEmail}</div>
                {item.contactPhone && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>📱 {item.contactPhone}</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function ReportModal({ type, onClose, onCreated }) {
  const [form, setForm] = useState({
    type, title: '', description: '', location: '', dateLostFound: '',
    category: 'other', image: '', contactName: '', contactEmail: '', contactPhone: '',
  })
  const [loading, setLoading] = useState(false)
  const handleImage = (e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB')
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, image: reader.result }))
    reader.readAsDataURL(file)
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const required = ['title', 'description', 'location', 'dateLostFound', 'contactName', 'contactEmail']
    for (const k of required) { if (!form[k]) return toast.error(`Please fill: ${k}`) }
    setLoading(true)
    try {
      const data = await api.post('/lost-found', form)
      toast.success(`${type === 'lost' ? '🔴 Lost' : '🟢 Found'} item reported!`)
      onCreated(data.data); onClose()
    } catch (err) { toast.error(err.message || 'Failed') }
    finally { setLoading(false) }
  }
  const isLost = type === 'lost'
  const ac = isLost ? '#ef4444' : '#10b981'
  const inputStyle = { width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{ background: 'var(--bg-card-solid)', border: `1px solid ${ac}44`, borderRadius: 20, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{isLost ? '🔴 Report Lost Item' : '🟢 Report Found Item'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Item Name *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder={isLost ? 'e.g. iPhone 14 Black Case' : 'e.g. Found Blue Water Bottle'} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ ...inputStyle, appearance: 'none' }}>
              {CATEGORIES.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Location *</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. CR106, Library" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Date *</label>
              <input type="date" value={form.dateLostFound} onChange={e => setForm(f => ({ ...f, dateLostFound: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the item — color, brand, distinctive features..." rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handleImage} style={{ fontSize: 12, color: 'var(--text-secondary)' }} />
            {form.image && <img src={form.image} alt="preview" style={{ marginTop: 8, width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />}
          </div>
          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Contact Information *</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Your Name *" style={inputStyle} />
              <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="Email * (yourname@gehu.ac.in)" style={inputStyle} />
              <input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="Phone (optional)" style={inputStyle} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#374151' : `linear-gradient(135deg, ${ac}, ${isLost ? '#f97316' : '#14b8a6'})`,
            color: 'white', fontSize: 14, fontWeight: 700, marginTop: 4,
          }}>
            {loading ? '⏳ Submitting...' : `${isLost ? '🔴 Report Lost' : '🟢 Report Found'}`}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function LostFoundPage() {
  const [activeTab, setActiveTab] = useState('lost')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(null)
  const [catFilter, setCatFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchItems = useCallback(async () => {
    try {
      const data = await api.get('/lost-found?status=open')
      setItems(data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleResolve = async (id) => {
    try {
      await api.patch(`/lost-found/${id}/resolve`)
      setItems(prev => prev.map(i => i._id === id ? { ...i, status: 'resolved' } : i))
      toast.success('Marked as resolved ✅')
    } catch { toast.error('Could not update status') }
  }

  const filtered = items
    .filter(i => i.type === activeTab)
    .filter(i => catFilter === 'all' || i.category === catFilter)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()))

  const lostCount = items.filter(i => i.type === 'lost' && i.status === 'open').length
  const foundCount = items.filter(i => i.type === 'found' && i.status === 'open').length

  return (
    <div style={{ padding: '24px 28px 40px', fontFamily: 'Inter, sans-serif', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Hero with action buttons */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(16,185,129,0.08))',
          border: '1px solid var(--border-default)', borderRadius: 20, padding: '24px 28px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 44 }}>🔍</div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Lost & Found</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '4px 0 0' }}>Help reunite lost items with their owners</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowModal('lost')} style={{
            padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.4)',
            background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>🔴 Report Lost</button>
          <button onClick={() => setShowModal('found')} style={{
            padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(16,185,129,0.4)',
            background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>🟢 Report Found</button>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Lost Items', count: lostCount, color: '#ef4444', emoji: '🔴', bg: 'rgba(239,68,68,0.06)' },
          { label: 'Found Items', count: foundCount, color: '#10b981', emoji: '🟢', bg: 'rgba(16,185,129,0.06)' },
        ].map(({ label, count, color, emoji, bg }) => (
          <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: bg, border: `1px solid ${color}25`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{emoji}</span>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color }}>{count}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label} Open</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--input-bg)', borderRadius: 12, padding: 4, marginBottom: 20, border: '1px solid var(--border-default)' }}>
        {['lost', 'found'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
            background: activeTab === tab ? (tab === 'lost' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)') : 'transparent',
            color: activeTab === tab ? (tab === 'lost' ? '#f87171' : '#34d399') : 'var(--text-muted)',
          }}>{tab === 'lost' ? '🔴 Lost Items' : '🟢 Found Items'}</button>
        ))}
      </div>

      {/* Search + Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search items..."
          style={{ flex: 1, minWidth: 200, background: 'var(--input-bg)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {CATEGORIES.slice(0, 6).map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: catFilter === cat ? `${CAT_COLORS[cat] || '#14b8a6'}22` : 'var(--input-bg)',
              border: `1px solid ${catFilter === cat ? (CAT_COLORS[cat] || '#14b8a6') : 'var(--border-default)'}`,
              color: catFilter === cat ? (CAT_COLORS[cat] || '#14B8A6') : 'var(--text-muted)',
            }}>{CATEGORY_EMOJI[cat]} {cat}</button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(20,184,166,0.2)', borderTop: '3px solid #14b8a6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>{activeTab === 'lost' ? '🔍' : '🎁'}</div>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>No {activeTab} items found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Click "Report {activeTab === 'lost' ? 'Lost' : 'Found'}" to add one</p>
        </motion.div>
      ) : (
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          <AnimatePresence>
            {filtered.map(item => <ItemCard key={item._id} item={item} onResolve={handleResolve} />)}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && <ReportModal type={showModal} onClose={() => setShowModal(null)} onCreated={item => setItems(prev => [item, ...prev])} />}
      </AnimatePresence>
    </div>
  )
}
