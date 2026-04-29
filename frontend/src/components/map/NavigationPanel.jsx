// NavigationPanel.jsx — Premium dark bottom navigation bar
import { motion } from 'framer-motion'
import { useMap } from '../../context/MapContext'
import toast from 'react-hot-toast'

const selectStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(20,184,166,0.2)',
  borderRadius: 10,
  padding: '9px 28px 9px 10px',
  fontSize: 12,
  color: '#e2e8f0',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235eead4' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s',
}

const labelStyle = {
  fontSize: 10,
  fontWeight: 700,
  color: '#475569',
  marginBottom: 4,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
}

export default function NavigationPanel({ setShowScanner }) {
  const {
    source, setSource, destination, setDestination,
    roomsByFloor, roomDataForDropdown, calculatePath, resetNavigation,
    walkTime, loading, currentPath,
  } = useMap()

  const dropdownRooms = roomDataForDropdown?.rooms?.length > 0
    ? roomDataForDropdown.rooms
    : roomsByFloor.map(({ floor, label, rooms }) => ({
        floor_label: label,
        room_data: rooms.map(r => ({ roomid: r.id, room_name: r.name }))
      }))

  const hasRoute = Boolean(currentPath?.segments?.length > 0)

  const handleGo = () => {
    if (!source || !destination) {
      toast.error('Please choose both start and destination')
      return
    }
    if (source === destination) {
      toast('Start and destination are the same!', { icon: '🤔' })
      return
    }
    calculatePath()
  }

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(135deg, rgba(5,15,30,0.97), rgba(8,22,42,0.98))',
        backdropFilter: 'blur(20px)',
        padding: '10px 12px 14px',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.6)',
        zIndex: 1000,
        borderTop: '1px solid rgba(20,184,166,0.15)',
      }}
    >
      {/* Drag handle */}
      <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 32, height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.1)' }} />

      {/* Source */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={labelStyle}>📍 Start</div>
        <select
          id="nav-source"
          value={source}
          onChange={e => setSource(e.target.value)}
          style={{ ...selectStyle, color: source ? '#f0fdfa' : '#475569' }}
        >
          <option value="">Choose Start</option>
          {dropdownRooms.map((floorGroup, fi) => (
            <optgroup key={fi} label={floorGroup.floor_label}>
              {floorGroup.room_data.map((r, ri) => (
                <option key={ri} value={r.roomid}>{r.room_name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* QR Scan button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowScanner?.(true)}
        title="Scan QR code"
        style={{
          width: 38, height: 38, marginBottom: 1, flexShrink: 0,
          background: 'rgba(20,184,166,0.12)',
          border: '1px solid rgba(20,184,166,0.3)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#5eead4',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h7v7H3V3zm1 1v5h5V4H4zm1 1h3v3H5V5zM3 14h7v7H3v-7zm1 1v5h5v-5H4zm1 1h3v3H5v-3zM14 3h7v7h-7V3zm1 1v5h5V4h-5zm1 1h3v3h-3V5zM14 14h2v2h-2v-2zm3 0h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 0h2v2h-2v-2zm3-3h1v5h-4v-2h3v-3zm-4 4h2v2h-2v-2z"/>
        </svg>
      </motion.button>

      {/* Destination */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={labelStyle}>
          🏁 Destination
          {hasRoute && walkTime && (
            <span style={{ marginLeft: 6, color: '#5eead4', fontWeight: 800 }}>
              🚶 {walkTime}
            </span>
          )}
        </div>
        <select
          id="nav-destination"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          style={{ ...selectStyle, color: destination ? '#f0fdfa' : '#475569' }}
        >
          <option value="">Choose Destination</option>
          {dropdownRooms.map((floorGroup, fi) => (
            <optgroup key={fi} label={floorGroup.floor_label}>
              {floorGroup.room_data.map((r, ri) => (
                <option key={ri} value={r.roomid}>{r.room_name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Go / Clear button */}
      <motion.button
        id="nav-go"
        whileHover={!loading ? { scale: 1.04 } : {}}
        whileTap={!loading ? { scale: 0.96 } : {}}
        onClick={hasRoute ? resetNavigation : handleGo}
        disabled={loading}
        style={{
          padding: '0 16px',
          height: 38,
          flexShrink: 0,
          background: loading
            ? 'rgba(100,116,139,0.3)'
            : hasRoute
              ? 'rgba(239,68,68,0.15)'
              : 'linear-gradient(135deg, #0d9488, #2563eb)',
          border: loading
            ? '1px solid rgba(100,116,139,0.2)'
            : hasRoute
              ? '1px solid rgba(239,68,68,0.4)'
              : '1px solid rgba(13,148,136,0.4)',
          borderRadius: 10,
          color: loading ? '#64748b' : hasRoute ? '#f87171' : 'white',
          fontSize: 14,
          fontWeight: 800,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          marginBottom: 1,
          letterSpacing: 0.3,
          boxShadow: (!loading && !hasRoute) ? '0 0 16px rgba(13,148,136,0.4)' : 'none',
          transition: 'all 0.2s',
          minWidth: 56,
        }}
      >
        {loading
          ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid #5eead4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          : hasRoute
            ? '✕'
            : 'Go'
        }
      </motion.button>
    </motion.div>
  )
}
