import { useEffect, useRef } from 'react'
import { useMap as useLeafletMap } from 'react-leaflet'
import L from 'leaflet'
import { getRoomName } from '../../data/navitRoomNames'

// ── Distinct color per room type ─────────────────────────────────────────
const TYPE_COLORS = {
  class:          { fill: '#bfdbfe', stroke: '#3b82f6' },   // blue   – classrooms
  lab:            { fill: '#ddd6fe', stroke: '#7c3aed' },   // violet – labs
  lt:             { fill: '#fbcfe8', stroke: '#db2777' },   // pink   – lecture theatres
  staffroom:      { fill: '#fde68a', stroke: '#d97706' },   // amber  – staff rooms
  office:         { fill: '#bbf7d0', stroke: '#16a34a' },   // green  – offices
  library:        { fill: '#fed7aa', stroke: '#ea580c' },   // orange – library
  auditorium:     { fill: '#e9d5ff', stroke: '#9333ea' },   // purple – auditorium
  canteen:        { fill: '#fef9c3', stroke: '#ca8a04' },   // yellow – canteen/cafeteria
  washroom:       { fill: '#cffafe', stroke: '#0891b2' },   // cyan   – washrooms
  staircase:      { fill: '#f3f4f6', stroke: '#9ca3af' },   // gray   – stairs/lift
  floormap:       { fill: 'rgba(16,185,129,0.12)', stroke: '#10b981' }, // subtle green – boundary
  other:          { fill: '#e0f2fe', stroke: '#0284c7' },   // light blue – fallback
}

/**
 * Infer room type from room_id since the Navit API does NOT include
 * a `type` field for most rooms (it only has `indoor:"room"`).
 * The room numbering scheme encodes the floor:
 *   < 1000     → Basement / admin
 *   1000–1999  → Ground floor
 *   2000–2999  → 1st floor  … and so on.
 */
function inferType(rawId, props) {
  // ── Amenity-tagged features ───────────────────────────────────────
  const amenity = props?.amenity
  if (amenity === 'toilets')    return 'washroom'
  if (amenity === 'parking')    return 'floormap'
  if (amenity === 'university') return 'floormap'
  if (amenity === 'canteen')    return 'canteen'
  if (amenity === 'library')    return 'library'
  if (amenity === 'auditorium') return 'auditorium'

  // ── Room-tagged features ──────────────────────────────────────────
  const room = props?.room
  if (room === 'stairs' || room === 'elevator') return 'staircase'

  // ── Indoor area boundary ──────────────────────────────────────────
  if (props?.indoor === 'area') return 'floormap'

  // ── Room-ID number ranges ─────────────────────────────────────────
  const id  = parseInt(rawId, 10)
  if (isNaN(id)) return 'other'

  // Local (< 1000) → basement / admin zone
  if (id < 1000) {
    if ([73, 85, 91, 1166].includes(id)) return 'canteen'
    if ([15, 17, 122, 6, 2006, 2025, 4091].includes(id)) return 'office'
    if ([4].includes(id)) return 'office'
    return 'office'
  }

  // Ground through 6th floor: pattern xxYY where xx = floor+10
  const suffix = id % 1000  // 0-999 within each floor block

  // Staffrooms end in 56/57
  if (suffix === 56 || suffix === 57) return 'staffroom'
  // Washrooms end in 37/38/97/98/99
  if ([37,38,97,98,99].includes(suffix)) return 'washroom'

  // Libraries: 1105 (G), 2119 (1F), 6101 (6F)
  if ([1105, 2119, 6101].includes(id)) return 'library'

  // Labs: end in 69 or 01 (Ubuntu/Mac labs) or specific known IDs
  if (suffix === 69 || suffix === 101) return 'lab'
  if ([1001,1003,1006].includes(id)) return 'lab'  // Ubuntu/Mac labs

  // Lecture theatres: contain 'lt' in name, or specific IDs
  const name = getRoomName(String(id)).toLowerCase()
  if (name.startsWith('lt') || /lecture/.test(name)) return 'lt'

  // Auditorium
  if (name.includes('auditorium') || name.includes('seminar') || name.includes('moot')) return 'auditorium'

  // Canteen / cafeteria / dining
  if (name.includes('canteen') || name.includes('cafeteria') || name.includes('dining')) return 'canteen'

  // Washrooms
  if (name.includes('washroom') || name.includes('toilet')) return 'washroom'

  // Offices
  if (name.includes('office') || name.includes('registrar') || name.includes('cell') || name.includes('dept')) return 'office'

  // Staff rooms
  if (name.includes('staff')) return 'staffroom'

  // CR = classroom
  if (name.startsWith('cr')) return 'class'

  // Labs
  if (name.includes('lab')) return 'lab'

  // Default: classroom for numbered rooms
  return 'class'
}

function getStyle(type) {
  const c = TYPE_COLORS[type] || TYPE_COLORS.other
  const isFloormap = type === 'floormap'
  return {
    fillColor:   c.fill,
    color:       c.stroke,
    weight:      isFloormap ? 2 : 1.5,
    fillOpacity: isFloormap ? 0.1 : 0.75,
    opacity:     1,
    // floormap boundaries must NOT capture pointer events
    interactive: !isFloormap,
  }
}

function getHoverStyle(type) {
  const c = TYPE_COLORS[type] || TYPE_COLORS.other
  return {
    fillColor:   c.fill,
    color:       c.stroke,
    weight:      3,
    fillOpacity: 1,
    opacity:     1,
    interactive: true,
  }
}

function makeLabel(displayName, zoom) {
  if (zoom < 17) return ''
  const text = zoom < 19 && displayName.length > 14
    ? displayName.slice(0, 12) + '…'
    : displayName
  return `<span style="
    font-size:10px;
    font-weight:700;
    color:#1e293b;
    white-space:nowrap;
    pointer-events:none;
    text-shadow:0 0 3px rgba(255,255,255,0.9),0 0 3px rgba(255,255,255,0.9);
  ">${text}</span>`
}

export default function RoomLayer({ activeFloor, floorMap, onRoomClick }) {
  const map      = useLeafletMap()
  const geoRef   = useRef(null)
  const labelRef = useRef(null)

  const draw = () => {
    if (geoRef.current) {
      try { map.removeLayer(geoRef.current._boundaryLayer) } catch {}
      try { map.removeLayer(geoRef.current) } catch {}
      geoRef.current = null
    }
    if (labelRef.current) { try { map.removeLayer(labelRef.current) } catch {} ; labelRef.current = null }

    if (!floorMap || !Array.isArray(floorMap)) return

    const floorStr   = String(activeFloor)
    const floorEntry = floorMap.find(f => f.floor === floorStr)
    if (!floorEntry?.map) return

    const zoom   = map.getZoom()
    const labels = L.layerGroup()

    // ── Split features: boundaries first, rooms on top ────────
    const allFeatures = floorEntry.map?.features || []

    // 1) Non-interactive boundary layer (drawn BELOW rooms)
    const boundaryGeo = {
      ...floorEntry.map,
      features: allFeatures.filter(f => {
        const rawId = String(f.properties?.room_id || f.properties?.id || '')
        const type  = inferType(rawId, f.properties)
        return type === 'floormap' || rawId.length > 6 || (!f.properties?.room_id && f.properties?.highway)
      }),
    }
    const boundaryLayer = L.geoJSON(boundaryGeo, {
      interactive: false,
      style: (feature) => {
        const rawId = String(feature.properties?.room_id || feature.properties?.id || '')
        const type  = inferType(rawId, feature.properties)
        const s = getStyle(type)
        return { ...s, interactive: false }
      },
    })
    boundaryLayer.addTo(map)

    // 2) Interactive room layer (drawn ON TOP of boundaries)
    const roomGeo = {
      ...floorEntry.map,
      features: allFeatures.filter(f => {
        const rawId = String(f.properties?.room_id || f.properties?.id || '')
        const type  = inferType(rawId, f.properties)
        if (type === 'floormap') return false
        if (rawId.length > 6) return false
        if (!f.properties?.room_id && f.properties?.highway) return false
        return true
      }),
    }
    const geo = L.geoJSON(roomGeo, {
      style: (feature) => {
        const rawId = String(feature.properties?.room_id || feature.properties?.id || '')
        const type  = inferType(rawId, feature.properties)
        return getStyle(type)
      },

      onEachFeature: (feature, layer) => {
        const rawId = String(feature.properties?.room_id || feature.properties?.id || '')
        const props = feature.properties || {}
        const type  = inferType(rawId, props)

        // ── Room name ─────────────────────────────────────────────
        const apiName     = props.name
        const displayName = getRoomName(rawId)
          || (apiName && apiName !== rawId && apiName !== String(rawId) ? apiName : '')
          || rawId

        // ── Label ─────────────────────────────────────────────────
        try {
          const center = layer.getBounds().getCenter()
          const html   = makeLabel(displayName, zoom)
          if (html) {
            labels.addLayer(L.marker(center, {
              icon: L.divIcon({ className: '', html, iconSize:[0,0], iconAnchor:[0,0] }),
              interactive: false,
              zIndexOffset: 100,
            }))
          }
        } catch {}

        // ── After layer is ready, force pointer-events on SVG element ─
        layer.on('add', () => {
          try {
            const el = layer.getElement ? layer.getElement() : null
            if (el) {
              el.style.pointerEvents = 'all'
              el.style.cursor = 'pointer'
            }
          } catch {}
        })

        // ── Hover & cursor ────────────────────────────────────────
        const base  = getStyle(type)
        const hover = getHoverStyle(type)
        layer.on('mouseover', () => {
          layer.setStyle(hover)
          try {
            const el = layer.getElement ? layer.getElement() : null
            if (el) el.style.cursor = 'pointer'
          } catch {}
        })
        layer.on('mouseout', () => layer.setStyle(base))

        // ── Click (entire box, not just outline) ──────────────────
        layer.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          let center = [e.latlng.lat, e.latlng.lng]
          try {
            const c = layer.getBounds().getCenter()
            center = [c.lat, c.lng]
          } catch (err) {}
          onRoomClick?.({ ...props, name: displayName, room_id: rawId, inferredType: type, floor: activeFloor, center })
        })
      },
    })

    // Store both layers so we can clean them up
    geo._boundaryLayer = boundaryLayer

    geo.addTo(map)
    labels.addTo(map)
    geoRef.current   = geo
    labelRef.current = labels
  }

  useEffect(() => {
    if (!floorMap) return
    draw()
    map.on('zoomend', draw)
    return () => {
      map.off('zoomend', draw)
      if (geoRef.current) {
        // Remove boundary layer stored on geo object
        try { map.removeLayer(geoRef.current._boundaryLayer) } catch {}
        try { map.removeLayer(geoRef.current) } catch {}
      }
      if (labelRef.current) { try { map.removeLayer(labelRef.current) } catch {} }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFloor, floorMap])

  return null
}
