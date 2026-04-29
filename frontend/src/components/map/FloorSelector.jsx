// FloorSelector.jsx — Premium animated floor selector buttons
import { motion } from 'framer-motion'
import { useMap } from '../../context/MapContext'

const FLOORS = [
  { num: -1, label: 'B', fullName: 'Basement' },
  { num:  0, label: 'G', fullName: 'Ground Floor' },
  { num:  1, label: '1', fullName: 'Floor 1' },
  { num:  2, label: '2', fullName: 'Floor 2' },
  { num:  3, label: '3', fullName: 'Floor 3' },
  { num:  4, label: '4', fullName: 'Floor 4' },
  { num:  5, label: '5', fullName: 'Floor 5' },
  { num:  6, label: '6', fullName: 'Floor 6' },
]

export default function FloorSelector() {
  const { activeFloor, setActiveFloor } = useMap()

  return (
    <div style={{
      position: 'fixed',
      left: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      zIndex: 1000,
    }}>
      {/* Container glass pill */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(5,15,30,0.9), rgba(8,22,42,0.95))',
        border: '1px solid rgba(20,184,166,0.15)',
        borderRadius: 24,
        padding: '6px 4px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {FLOORS.map(({ num, label, fullName }, idx) => {
          const isActive = activeFloor === num
          return (
            <motion.button
              key={num}
              id={`floor-btn-${label}`}
              onClick={() => setActiveFloor(num)}
              title={fullName}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, type: 'spring', stiffness: 300 }}
              whileTap={{ scale: 0.92 }}
              whileHover={!isActive ? { scale: 1.08 } : {}}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: isActive
                  ? 'linear-gradient(135deg, #0d9488, #2563eb)'
                  : 'rgba(255,255,255,0.04)',
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                fontWeight: isActive ? 900 : 700,
                fontSize: 13,
                border: isActive
                  ? '2px solid rgba(20,184,166,0.6)'
                  : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isActive
                  ? '0 0 16px rgba(13,148,136,0.6), 0 0 4px rgba(13,148,136,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : 'none',
                transition: 'background 0.2s, color 0.2s, border 0.2s',
                position: 'relative',
                letterSpacing: 0.5,
              }}
            >
              {label}
              {/* Active pulse ring */}
              {isActive && (
                <motion.span
                  style={{
                    position: 'absolute',
                    inset: -3,
                    borderRadius: '50%',
                    border: '2px solid rgba(20,184,166,0.4)',
                    pointerEvents: 'none',
                  }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
