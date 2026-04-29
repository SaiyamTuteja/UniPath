import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import { fetchNavitPath, formatWalkTime, getRoomsByFloor } from '../utils/pathfinding'
import { getRoomName } from '../data/navitRoomNames'

const MapContext = createContext(null)

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000  // 7 days
const UNIPATH_API = 'https://navit.onrender.com'

export const MapProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()

  // ── GeoJSON floor map (from Navit API) ────────────────────────
  const [floorMap, setFloorMap] = useState(null)  // [{floor:'0', map: GeoJSON}, ...]
  const [roomStatusData, setRoomStatusData] = useState(null)
  const [roomStatusMap, setRoomStatusMap] = useState({})  // keyed by room name
  const [hitcount, setHitcount] = useState(0)
  const [roomDataForDropdown, setRoomDataForDropdown] = useState({ rooms: [], amenities: [] })

  // ── Navigation state ─────────────────────────────────────────────
  const [activeFloor, setActiveFloor] = useState(0)
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  // currentPath = { segments: [{floor, coords}], distanceM } | null
  const [currentPath, setCurrentPath] = useState(null)
  const [walkTime, setWalkTime] = useState('Go')

  // ── UI state ────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [globalLoading, setGlobalLoading] = useState(true)
  const [timeslotLabel, setTimeslotLabel] = useState('Closed')

  // ── Time helpers ─────────────────────────────────────────────────
  const getDaySlot = () => ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()].toUpperCase()
  const getHourSlot = () => {
    const h = new Date().getHours()
    const s = (h > 12 ? h - 12 : h).toString().padStart(2, '0')
    const e = ((h + 1) > 12 ? (h + 1) - 12 : h + 1).toString().padStart(2, '0')
    return `${s}-${e}`
  }
  const daySlot = getDaySlot()
  const hourSlot = getHourSlot()
  const isActiveHour = () => { const h = new Date().getHours(); return !(h >= 8 && h <= 17) }

  // ── Build dropdown room list from floorMap ───────────────────────
  const buildDropdownFromFloorMap = (floorMapData) => {
    if (!floorMapData || !Array.isArray(floorMapData)) return
    const FLOOR_LABELS = { '-1': 'Basement (B)', '0': 'Ground floor (G)', '1': '1st floor', '2': '2nd floor', '3': '3rd floor', '4': '4th floor', '5': '5th floor', '6': '6th floor' }
    const rooms = floorMapData
      .slice()
      .sort((a, b) => parseInt(a.floor) - parseInt(b.floor))
      .map(floorEntry => {
        const label = FLOOR_LABELS[floorEntry.floor] || `Floor ${floorEntry.floor}`
        const features = floorEntry.map?.features || []
        const roomData = features
          .filter(f => {
            const rid = String(f.properties?.room_id || '')
            if (!rid || rid.length === 0 || rid.length > 6) return false
            if (f.properties?.highway) return false
            if (f.properties?.indoor === 'area' && !f.properties?.room_id) return false
            return true
          })
          .map(f => {
            const rid     = String(f.properties.room_id)
            const apiName = f.properties?.name
            const resolved = getRoomName(rid)
              || (apiName && apiName !== rid && apiName !== String(rid) ? apiName : '')
              || rid
            return { roomid: rid, room_name: resolved }
          })
          .filter((r, i, arr) => arr.findIndex(x => x.roomid === r.roomid) === i)
          .sort((a, b) => a.room_name.localeCompare(b.room_name))
        return { floor_label: label, room_data: roomData }
      }).filter(r => r.room_data.length > 0)
    setRoomDataForDropdown({ rooms, amenities: [] })
  }

  // ── Fetch floor GeoJSON from Navit live API ─────────────────────
  const fetchGeoJSON = useCallback(async () => {
    setLoading(true)
    const toastId = 'map-fetch'
    try {
      const cached = localStorage.getItem('unipath_mapData')
      const cacheDate = localStorage.getItem('unipath_mapsetsdate')
      if (cached && cacheDate && Date.now() - parseInt(cacheDate) < CACHE_TTL) {
        const parsed = JSON.parse(cached)
        setFloorMap(parsed)
        setHitcount(parseInt(localStorage.getItem('unipath_hitcount') || '0'))
        buildDropdownFromFloorMap(parsed)
        return
      }
      const res = await fetch(`${UNIPATH_API}/getmap`)
      const data = await res.json()
      localStorage.setItem('unipath_mapData', JSON.stringify(data.data))
      localStorage.setItem('unipath_mapsetsdate', Date.now().toString())
      localStorage.setItem('unipath_hitcount', String(data.hitcount || 0))
      setFloorMap(data.data)
      setHitcount(data.hitcount || 0)
      buildDropdownFromFloorMap(data.data)
    } catch (err) {
      console.warn('Navit map fetch failed:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch room status (occupancy) ───────────────────────────────
  const fetchRoomStatus = useCallback(async () => {
    try {
      const cached = localStorage.getItem('roomstatus_infocache')
      const cacheDate = localStorage.getItem('roomstatus_setdate')
      if (cached && cacheDate && Date.now() - new Date(cacheDate).getTime() < CACHE_TTL) {
        const rooms = JSON.parse(cached)
        setRoomStatusData(rooms)
        buildStatusMap(rooms)
        return
      }
      setLoading(true)
      const res = await fetch('/api/map/rooms')
      const result = await res.json()
      const rooms = result.data || []
      localStorage.setItem('roomstatus_infocache', JSON.stringify(rooms))
      localStorage.setItem('roomstatus_setdate', new Date().toISOString())
      setRoomStatusData(rooms)
      buildStatusMap(rooms)
    } catch (err) {
      console.warn('Room status fetch failed:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Build a map keyed by room name (matches NAV_NODES keys)
  const buildStatusMap = (rooms) => {
    const m = {}
    rooms.forEach(r => { if (r.name) m[r.name] = r })
    setRoomStatusMap(m)
  }

  // ── Real Navit API pathfinding ────────────────────────────────────
  const calculatePath = useCallback(async () => {
    if (!source || !destination || source === destination) return
    setLoading(true)
    try {
      const result = await fetchNavitPath(source, destination)
      if (!result || result.segments.length === 0) {
        toast.error('No path found between these locations', { duration: 3000 })
        setCurrentPath(null)
        setWalkTime('~1 min')
        return
      }

      const { segments, distanceM } = result
      setCurrentPath({ segments, distanceM })
      setWalkTime(formatWalkTime(distanceM))

      // Auto-switch to the first segment's floor
      const firstFloor = segments[0]?.floor
      const floorNumMap = { '-1': -1, '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6 }
      if (firstFloor !== undefined) {
        setActiveFloor(floorNumMap[firstFloor] ?? 0)
      }

      toast.success(`Route found \u2014 ${formatWalkTime(distanceM)} walk`, { duration: 2500 })
    } catch (err) {
      console.error('Path fetch error:', err)
      toast.error('Could not fetch route. Check connection.', { duration: 3000 })
      setCurrentPath(null)
    } finally {
      setLoading(false)
    }
  }, [source, destination])

  const resetNavigation = () => {
    setSource('')
    setDestination('')
    setCurrentPath(null)
    setWalkTime('Go')
    setActiveFloor(0)
  }

  // ── Effects ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setGlobalLoading(true)
      const h = new Date().getHours()
      setTimeslotLabel(h >= 18 || h <= 7 ? 'Closed' : `${getDaySlot()} ${getHourSlot()}`)
      try { await fetchGeoJSON() } catch { }
      setGlobalLoading(false)
    }
    init()
  }, [])

  useEffect(() => { if (isAuthenticated) fetchRoomStatus() }, [isAuthenticated])

  useEffect(() => {
    if (source && destination) calculatePath()
  }, [source, destination])

  // Rooms for dropdown — from navigationGraph (always available, no backend needed)
  const roomsByFloor = getRoomsByFloor()

  return (
    <MapContext.Provider value={{
      // Map data
      floorMap, roomStatusData, roomStatusMap, hitcount,
      // Navigation
      activeFloor, setActiveFloor,
      source, setSource, destination, setDestination,
      currentPath, walkTime,
      // Room list for selectors (legacy static nav graph)
      roomsByFloor,
      // Live room list from Navit API
      roomDataForDropdown,
      // State
      loading, globalLoading, timeslotLabel, daySlot, hourSlot, isActiveHour,
      // Actions
      fetchGeoJSON, fetchRoomStatus, calculatePath, resetNavigation,
    }}>
      {children}
    </MapContext.Provider>
  )
}

export const useMap = () => {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMap must be used within MapProvider')
  return ctx
}

export default MapContext
