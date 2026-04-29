import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const TAG_OPTIONS = ['Tech','Cultural','Sports','Seminar','Workshop','Fest','Academic','Other']

const S = {
  page: { minHeight:'100vh', background:'linear-gradient(135deg,#020b18,#0a1628)', color:'white', fontFamily:'Inter,sans-serif' },
  header: { position:'sticky',top:0,zIndex:100,background:'rgba(2,11,24,0.95)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(245,158,11,0.2)',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between' },
  card: { background:'rgba(13,33,53,0.8)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:16 },
  input: { width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'9px 12px',color:'white',fontSize:13,outline:'none',boxSizing:'border-box' },
  btn: (c='#0d9488') => ({ padding:'8px 16px',borderRadius:8,border:'none',background:c,color:'white',fontSize:12,fontWeight:700,cursor:'pointer' }),
  label: { fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:0.5 },
  statCard: (c) => ({ background:`${c}11`,border:`1px solid ${c}33`,borderRadius:12,padding:'16px 20px' }),
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={S.statCard(color)}>
      <div style={{ fontSize:28 }}>{icon}</div>
      <div style={{ fontSize:28,fontWeight:900,color,marginTop:4 }}>{value ?? '—'}</div>
      <div style={{ fontSize:11,color:'#64748b',fontWeight:600 }}>{label}</div>
    </div>
  )
}

function CreateEventForm({ onCreated }) {
  const [f, setF] = useState({ title:'',description:'',date:'',time:'',venue:'',organizer:'',tags:[],registrationLink:'',image:'' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const toggleTag = t => set('tags', f.tags.includes(t) ? f.tags.filter(x=>x!==t) : [...f.tags,t])
  const handleImg = e => {
    const file = e.target.files[0]; if(!file) return
    if(file.size>2*1024*1024) return toast.error('Max 2MB')
    const r = new FileReader(); r.onload=()=>set('image',r.result); r.readAsDataURL(file)
  }
  const submit = async e => {
    e.preventDefault()
    if(!f.title||!f.description||!f.date||!f.time||!f.venue||!f.organizer) return toast.error('Fill all required fields')
    setLoading(true)
    try { const d=await api.post('/admin/events',f); toast.success('Event created!'); onCreated(d.data); setF({title:'',description:'',date:'',time:'',venue:'',organizer:'',tags:[],registrationLink:'',image:''}) }
    catch(err) { toast.error(err.message||'Failed') }
    finally { setLoading(false) }
  }
  const row = { display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }
  return (
    <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:10 }}>
      <div>
        <label style={S.label}>Event Title *</label>
        <input value={f.title} onChange={e=>set('title',e.target.value)} placeholder="Annual Tech Fest 2025" style={S.input}/>
      </div>
      <div style={row}>
        <div><label style={S.label}>Venue *</label><input value={f.venue} onChange={e=>set('venue',e.target.value)} placeholder="Main Auditorium" style={S.input}/></div>
        <div><label style={S.label}>Organizer *</label><input value={f.organizer} onChange={e=>set('organizer',e.target.value)} placeholder="CSE Dept" style={S.input}/></div>
      </div>
      <div style={row}>
        <div><label style={S.label}>Date *</label><input type="date" value={f.date} onChange={e=>set('date',e.target.value)} style={{...S.input,colorScheme:'dark'}}/></div>
        <div><label style={S.label}>Time *</label><input type="time" value={f.time} onChange={e=>set('time',e.target.value)} style={{...S.input,colorScheme:'dark'}}/></div>
      </div>
      <div>
        <label style={S.label}>Description *</label>
        <textarea value={f.description} onChange={e=>set('description',e.target.value)} rows={3} placeholder="Event details..." style={{...S.input,resize:'vertical',fontFamily:'inherit'}}/>
      </div>
      <div>
        <label style={S.label}>Tags</label>
        <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
          {TAG_OPTIONS.map(t=>(
            <button key={t} type="button" onClick={()=>toggleTag(t)}
              style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,cursor:'pointer',background:f.tags.includes(t)?'rgba(20,184,166,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${f.tags.includes(t)?'#14b8a6':'rgba(255,255,255,0.1)'}`,color:f.tags.includes(t)?'#5eead4':'#64748b' }}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <label style={S.label}>Registration Link</label>
        <input value={f.registrationLink} onChange={e=>set('registrationLink',e.target.value)} placeholder="https://..." style={S.input}/>
      </div>
      <div>
        <label style={S.label}>Event Image (max 2MB)</label>
        <input type="file" accept="image/*" onChange={handleImg} style={{ fontSize:12,color:'#94a3b8' }}/>
        {f.image && <img src={f.image} alt="prev" style={{ marginTop:6,width:'100%',height:80,objectFit:'cover',borderRadius:8 }}/>}
      </div>
      <button type="submit" disabled={loading} style={{...S.btn('linear-gradient(135deg,#0d9488,#2563eb)'),width:'100%',padding:'11px',fontSize:14}}>
        {loading ? '⏳ Publishing...' : '📅 Publish Event'}
      </button>
    </form>
  )
}

function EventsTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const load = useCallback(async()=>{
    try { const d=await api.get('/admin/events'); setEvents(d.data||[]) }
    catch{} finally { setLoading(false) }
  },[])
  useEffect(()=>{ load() },[load])

  const del = async id => {
    if(!window.confirm('Delete this event?')) return
    try { await api.delete(`/admin/events/${id}`); setEvents(e=>e.filter(x=>x._id!==id)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const filtered = events.filter(e=>!search||e.title.toLowerCase().includes(search.toLowerCase())||e.organizer?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
        <h2 style={{ margin:0,fontSize:18,fontWeight:800,color:'#f1f5f9' }}>📅 Events Management</h2>
        <button onClick={()=>setShowForm(s=>!s)} style={S.btn(showForm?'#374151':'linear-gradient(135deg,#0d9488,#2563eb)')}>
          {showForm?'✕ Close':'+ Add Event'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} style={{...S.card,marginBottom:20,border:'1px solid rgba(20,184,166,0.3)'}}>
            <h3 style={{ margin:'0 0 14px',fontSize:15,fontWeight:800,color:'#5eead4' }}>✏️ Create New Event</h3>
            <CreateEventForm onCreated={e=>{ setEvents(p=>[e,...p]); setShowForm(false) }}/>
          </motion.div>
        )}
      </AnimatePresence>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search events..." style={{...S.input,marginBottom:12}}/>

      {loading ? (
        <div style={{ textAlign:'center',padding:'40px 0',color:'#64748b' }}>Loading...</div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:'center',padding:'40px 0',color:'#64748b' }}>📭 No events found</div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {filtered.map(ev=>(
            <div key={ev._id} style={{...S.card,display:'flex',alignItems:'center',gap:12}}>
              {ev.image && <img src={ev.image} alt="" style={{ width:56,height:56,borderRadius:8,objectFit:'cover',flexShrink:0 }}/>}
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:800,fontSize:14,color:'#f1f5f9',marginBottom:2 }}>{ev.title}</div>
                <div style={{ fontSize:11,color:'#64748b' }}>
                  📍 {ev.venue} · 👤 {ev.organizer} · 📅 {new Date(ev.date).toLocaleDateString('en-IN')} {ev.time}
                </div>
                <div style={{ display:'flex',gap:4,marginTop:4,flexWrap:'wrap' }}>
                  {(ev.tags||[]).map(t=><span key={t} style={{ fontSize:9,padding:'1px 6px',borderRadius:20,background:'rgba(20,184,166,0.15)',color:'#5eead4',border:'1px solid rgba(20,184,166,0.3)' }}>{t}</span>)}
                </div>
              </div>
              <button onClick={()=>del(ev._id)} style={{ ...S.btn('rgba(239,68,68,0.15)'),border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',flexShrink:0 }}>🗑️ Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LostFoundTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | flagged | open | resolved
  const [search, setSearch] = useState('')

  const load = useCallback(async()=>{
    try { const d=await api.get(`/admin/lost-found${filter==='flagged'?'?flag=flagged':''}`); setItems(d.data||[]) }
    catch{} finally { setLoading(false) }
  },[filter])
  useEffect(()=>{ setLoading(true); load() },[load])

  const flag = async(id,reason) => {
    try { await api.patch(`/admin/lost-found/${id}/flag`,{reason}); toast.success('⚑ Flagged as suspicious'); load() }
    catch { toast.error('Failed') }
  }
  const unflag = async id => {
    try { await api.patch(`/admin/lost-found/${id}/unflag`); toast.success('✓ Unflagged'); load() }
    catch { toast.error('Failed') }
  }
  const resolve = async id => {
    try { await api.patch(`/admin/lost-found/${id}/resolve`); toast.success('Resolved ✅'); setItems(p=>p.map(i=>i._id===id?{...i,status:'resolved'}:i)) }
    catch { toast.error('Failed') }
  }
  const del = async id => {
    if(!window.confirm('Remove this item?')) return
    try { await api.delete(`/admin/lost-found/${id}`); setItems(p=>p.filter(i=>i._id!==id)); toast.success('Removed') }
    catch { toast.error('Failed') }
  }

  const filtered = items
    .filter(i=>filter==='all'||filter==='flagged'||(filter==='open'&&i.status==='open')||(filter==='resolved'&&i.status==='resolved'))
    .filter(i=>!search||i.title.toLowerCase().includes(search.toLowerCase())||i.contactName?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
        <h2 style={{ margin:0,fontSize:18,fontWeight:800,color:'#f1f5f9' }}>🔍 Lost & Found Management</h2>
        <div style={{ fontSize:11,color:'#64748b' }}>{items.filter(i=>i.flagged).length} flagged · {items.filter(i=>i.status==='open').length} open</div>
      </div>

      <div style={{ display:'flex',gap:6,marginBottom:12,flexWrap:'wrap' }}>
        {['all','open','resolved','flagged'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:'5px 12px',borderRadius:20,fontSize:11,fontWeight:700,cursor:'pointer',background:filter===f?'rgba(245,158,11,0.2)':'rgba(255,255,255,0.04)',border:`1px solid ${filter===f?'rgba(245,158,11,0.5)':'rgba(255,255,255,0.08)'}`,color:filter===f?'#fbbf24':'#64748b' }}>
            {f==='flagged'?'⚑ Flagged':f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..." style={{...S.input,maxWidth:200,marginLeft:'auto'}}/>
      </div>

      {loading ? (
        <div style={{ textAlign:'center',padding:'40px 0',color:'#64748b' }}>Loading...</div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:'center',padding:'40px 0',color:'#64748b' }}>📭 No items found</div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {filtered.map(item=>(
            <div key={item._id} style={{ ...S.card, border:`1px solid ${item.flagged?'rgba(239,68,68,0.4)':item.type==='lost'?'rgba(239,68,68,0.15)':'rgba(16,185,129,0.15)'}`, background:item.flagged?'rgba(239,68,68,0.05)':'rgba(13,33,53,0.8)' }}>
              <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
                {item.image && <img src={item.image} alt="" style={{ width:52,height:52,borderRadius:8,objectFit:'cover',flexShrink:0 }}/>}
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:4 }}>
                    <span style={{ fontSize:10,padding:'1px 7px',borderRadius:20,fontWeight:800,background:item.type==='lost'?'rgba(239,68,68,0.15)':'rgba(16,185,129,0.15)',color:item.type==='lost'?'#f87171':'#34d399',border:`1px solid ${item.type==='lost'?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'}` }}>
                      {item.type==='lost'?'LOST':'FOUND'}
                    </span>
                    {item.flagged && <span style={{ fontSize:10,padding:'1px 7px',borderRadius:20,fontWeight:800,background:'rgba(239,68,68,0.2)',color:'#f87171',border:'1px solid rgba(239,68,68,0.4)' }}>⚑ FLAGGED</span>}
                    <span style={{ fontSize:10,padding:'1px 7px',borderRadius:20,fontWeight:700,background:item.status==='resolved'?'rgba(16,185,129,0.1)':'rgba(255,255,255,0.05)',color:item.status==='resolved'?'#34d399':'#64748b' }}>{item.status}</span>
                  </div>
                  <div style={{ fontWeight:800,fontSize:14,color:'#f1f5f9',marginBottom:2 }}>{item.title}</div>
                  <div style={{ fontSize:11,color:'#64748b',marginBottom:4 }}>📍 {item.location} · 👤 {item.contactName} · ✉️ {item.contactEmail}</div>
                  <div style={{ fontSize:11,color:'#94a3b8',display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{item.description}</div>
                  {item.flagged && item.flagReason && (
                    <div style={{ marginTop:6,padding:'4px 8px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:6,fontSize:11,color:'#fca5a5' }}>⚠️ Flag reason: {item.flagReason}</div>
                  )}
                </div>
              </div>
              <div style={{ display:'flex',gap:6,marginTop:10,flexWrap:'wrap' }}>
                {!item.flagged ? (
                  <button onClick={()=>{ const r=prompt('Flag reason:'); if(r) flag(item._id,r) }} style={{ ...S.btn('rgba(245,158,11,0.15)'),border:'1px solid rgba(245,158,11,0.3)',color:'#fbbf24' }}>⚑ Flag Suspicious</button>
                ) : (
                  <button onClick={()=>unflag(item._id)} style={{ ...S.btn('rgba(16,185,129,0.1)'),border:'1px solid rgba(16,185,129,0.3)',color:'#34d399' }}>✓ Unflag</button>
                )}
                {item.status!=='resolved' && (
                  <button onClick={()=>resolve(item._id)} style={{ ...S.btn('rgba(16,185,129,0.1)'),border:'1px solid rgba(16,185,129,0.3)',color:'#34d399' }}>✅ Resolve</button>
                )}
                <button onClick={()=>del(item._id)} style={{ ...S.btn('rgba(239,68,68,0.1)'),border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',marginLeft:'auto' }}>🗑️ Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(()=>{
    api.get('/admin/users').then(d=>setUsers(d.data||[])).catch(()=>{}).finally(()=>setLoading(false))
  },[])

  const changeRole = async (id, role) => {
    try { await api.patch(`/admin/users/${id}/role`,{role}); setUsers(p=>p.map(u=>u._id===id?{...u,role}:u)); toast.success(`Role → ${role}`) }
    catch { toast.error('Failed') }
  }
  const del = async id => {
    if(!window.confirm('Delete user?')) return
    try { await api.delete(`/admin/users/${id}`); setUsers(p=>p.filter(u=>u._id!==id)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const filtered = users.filter(u=>!search||`${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
  const ROLES = ['student','faculty','staff','admin']
  const ROLE_COLOR = { admin:'#f59e0b',faculty:'#3b82f6',staff:'#10b981',student:'#64748b' }

  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
        <h2 style={{ margin:0,fontSize:18,fontWeight:800,color:'#f1f5f9' }}>👥 User Management</h2>
        <div style={{ fontSize:11,color:'#64748b' }}>{users.length} total users</div>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search users..." style={{...S.input,marginBottom:12}}/>
      {loading ? (
        <div style={{ textAlign:'center',padding:'40px 0',color:'#64748b' }}>Loading...</div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
          {filtered.map(u=>(
            <div key={u._id} style={{ ...S.card,display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#0d9488,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:14,flexShrink:0 }}>
                {u.firstName?.[0]}{u.lastName?.[0]}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:13,color:'#f1f5f9' }}>{u.firstName} {u.lastName}</div>
                <div style={{ fontSize:11,color:'#64748b' }}>{u.email}</div>
              </div>
              <select value={u.role} onChange={e=>changeRole(u._id,e.target.value)}
                style={{ background:'rgba(255,255,255,0.05)',border:`1px solid ${ROLE_COLOR[u.role]||'#64748b'}44`,borderRadius:6,padding:'4px 8px',color:ROLE_COLOR[u.role]||'#94a3b8',fontSize:11,fontWeight:700,outline:'none',cursor:'pointer' }}>
                {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={()=>del(u._id)} style={{ ...S.btn('rgba(239,68,68,0.1)'),border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',padding:'5px 8px' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const { user, isGuest } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('events')
  const [stats, setStats] = useState(null)
  const ALLOWED = ['admin','faculty','staff']

  useEffect(()=>{
    if(isGuest||!user||!ALLOWED.includes(user.role)) { toast.error('Access denied'); navigate('/map') }
    else api.get('/admin/stats').then(d=>setStats(d.data)).catch(()=>{})
  },[user,isGuest,navigate])

  if(!user||isGuest||!ALLOWED.includes(user.role)) return null

  const TABS = [
    { id:'events', label:'📅 Events' },
    { id:'lostfound', label:'🔍 Lost & Found' },
    { id:'users', label:'👥 Users' },
  ]

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <Link to="/map" style={{ color:'#5eead4',textDecoration:'none',fontSize:12 }}>← Map</Link>
          <div style={{ width:1,height:16,background:'rgba(255,255,255,0.1)' }}/>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#f59e0b,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🛡️</div>
            <div>
              <div style={{ fontSize:15,fontWeight:900,background:'linear-gradient(90deg,#fbbf24,#f87171)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Admin Panel</div>
              <div style={{ fontSize:10,color:'#64748b' }}>{user.firstName} {user.lastName} · {user.role}</div>
            </div>
          </div>
        </div>
        <div style={{ fontSize:11,color:'#64748b' }}>UniPath GEHU</div>
      </div>

      <div style={{ maxWidth:960,margin:'0 auto',padding:'20px 16px' }}>
        {/* Stats */}
        {stats && (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10,marginBottom:24 }}>
            <StatCard label="Total Users" value={stats.totalUsers} icon="👥" color="#3b82f6"/>
            <StatCard label="Total Events" value={stats.totalEvents} icon="📅" color="#0d9488"/>
            <StatCard label="Lost & Found" value={stats.totalLostFound} icon="🔍" color="#8b5cf6"/>
            <StatCard label="Open Items" value={stats.openItems} icon="📋" color="#f59e0b"/>
            <StatCard label="Flagged" value={stats.flaggedItems} icon="⚑" color="#ef4444"/>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex',gap:4,background:'rgba(255,255,255,0.03)',borderRadius:12,padding:4,border:'1px solid rgba(255,255,255,0.06)',marginBottom:20 }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,padding:'9px',border:'none',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13,transition:'all 0.2s',background:tab===t.id?'rgba(245,158,11,0.15)':'transparent',color:tab===t.id?'#fbbf24':'#475569',boxShadow:tab===t.id?'0 0 10px rgba(245,158,11,0.2)':'none' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.15}}>
            {tab==='events' && <EventsTab/>}
            {tab==='lostfound' && <LostFoundTab/>}
            {tab==='users' && <UsersTab/>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
