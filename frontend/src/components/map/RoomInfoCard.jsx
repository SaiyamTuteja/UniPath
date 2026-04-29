import { motion } from 'framer-motion'
import { mapColorSet } from '../../utils/constants'

const TYPE_LABELS = {
  class: '📚 Classroom',
  lab: '🔬 Laboratory',
  computerlab: '💻 Computer Lab',
  staffroom: '👩‍🏫 Staff Room',
  office: '🏢 Office',
  library: '📖 Library',
  cafeteria: '🍽️ Cafeteria',
  ladieswashroom: '🚻 Ladies Washroom',
  gentswashroom: '🚹 Gents Washroom',
  other: '📍 Other',
}

export default function RoomInfoCard({
  roomname, course, section, subjectcode, roomid, type,
  capacity, semester, infotype, active
}) {
  const colors = {
    occupied: { bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'badge-occupied', label: '🔴 Occupied' },
    available: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'badge-available', label: '🟢 Available' },
    closed: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', badge: 'badge-closed', label: '⚫ Closed' },
    washroom: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'badge-available', label: '🚻 Washroom' },
  }
  const c = colors[infotype] || colors.closed
  const accentColor = mapColorSet[type]?.color || mapColorSet.other.color

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`min-w-[220px] max-w-[280px] rounded-2xl p-4 ${c.bg} border ${c.border} backdrop-blur-xl`}
    >
      {/* Room Name */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-white text-base leading-tight">{roomname}</h3>
          <div className="text-xs text-gray-400 mt-0.5">{TYPE_LABELS[type] || type}</div>
        </div>
        <span className={`shrink-0 ${c.badge} text-[10px]`}>
          {c.label}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-3" style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }} />

      {/* Details */}
      {infotype === 'occupied' && active && (
        <div className="space-y-1.5 mb-3">
          {course && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">📘 Course:</span>
              <span className="text-white font-medium">{course}</span>
            </div>
          )}
          {section && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">👥 Section:</span>
              <span className="text-cyan-400 font-bold">{section}</span>
            </div>
          )}
          {subjectcode && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">🔖 Code:</span>
              <span className="text-gray-300 font-mono text-xs">{subjectcode}</span>
            </div>
          )}
          {semester && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">📅 Sem:</span>
              <span className="text-gray-300">{semester}</span>
            </div>
          )}
        </div>
      )}

      {infotype === 'available' && (
        <div className="text-sm text-emerald-400 font-medium mb-3">✓ Available now</div>
      )}

      {infotype === 'closed' && (
        <div className="text-sm text-gray-500 mb-3">Campus is closed</div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {roomid && <span>ID: <span className="text-gray-400 font-mono">{roomid}</span></span>}
        {capacity > 0 && <span>Cap: <span className="text-gray-400">{capacity}</span></span>}
      </div>
    </motion.div>
  )
}
