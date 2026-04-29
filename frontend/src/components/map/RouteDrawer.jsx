// RouteDrawer.jsx — draws the real Navit path (GPS coordinates from API)
// currentPath = { segments: [{floor, coords: [[lat,lng],...]}], distanceM }

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

// Map floor string to numeric activeFloor value
const FLOOR_STR_TO_NUM = {
  '-1': -1, 'B': -1,
  '0': 0,   'G': 0,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6
}

export default function RouteDrawer({ routeData, activeFloor }) {
  const map = useMap()
  const layersRef = useRef([])

  useEffect(() => {
    // Clear old layers
    layersRef.current.forEach(l => { try { map.removeLayer(l) } catch {} })
    layersRef.current = []

    if (!routeData?.segments || routeData.segments.length === 0) return

    const { segments } = routeData
    const added = []

    segments.forEach((seg, segIdx) => {
      if (!seg.coords || seg.coords.length < 2) return

      const segFloorNum = FLOOR_STR_TO_NUM[seg.floor] ?? parseInt(seg.floor)
      const isActive = segFloorNum === activeFloor

      // Glow underline
      const glow = L.polyline(seg.coords, {
        color: isActive ? '#F59E0B' : '#94A3B8',
        weight: isActive ? 14 : 6,
        opacity: isActive ? 0.20 : 0.08,
        lineCap: 'round', lineJoin: 'round',
        interactive: false,
      }).addTo(map)

      // Main dashed line
      const line = L.polyline(seg.coords, {
        color: isActive ? '#F59E0B' : '#94A3B8',
        weight: isActive ? 5 : 2.5,
        opacity: isActive ? 0.95 : 0.45,
        dashArray: isActive ? '14 8' : '6 8',
        lineCap: 'round', lineJoin: 'round',
        interactive: false,
        className: isActive ? 'route-line-animated' : '',
      }).addTo(map)

      added.push(glow, line)

      // Direction arrows along active segment
      if (isActive) {
        for (let i = 0; i < seg.coords.length - 1; i++) {
          const [lat1, lng1] = seg.coords[i]
          const [lat2, lng2] = seg.coords[i + 1]
          const midLat = (lat1 + lat2) / 2
          const midLng = (lng1 + lng2) / 2
          const arrowAngle = Math.atan2(lng2 - lng1, lat2 - lat1) * (180 / Math.PI)
          const arrowIcon = L.divIcon({
            className: '',
            html: `<div style="transform:rotate(${arrowAngle}deg);width:12px;height:12px;filter:drop-shadow(0 0 2px rgba(0,0,0,0.5))">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <polygon points="6,0 12,12 6,9 0,12" fill="#F59E0B" stroke="#92400E" stroke-width="1"/>
              </svg>
            </div>`,
            iconSize: [12, 12], iconAnchor: [6, 6],
          })
          added.push(L.marker([midLat, midLng], { icon: arrowIcon, interactive: false }).addTo(map))
        }
      }
    })

    // Start marker (first coord of first segment)
    const firstSeg = segments[0]
    const lastSeg  = segments[segments.length - 1]
    const firstFloorNum = FLOOR_STR_TO_NUM[firstSeg.floor] ?? 0
    const lastFloorNum  = FLOOR_STR_TO_NUM[lastSeg.floor] ?? 0

    if (firstFloorNum === activeFloor && firstSeg.coords.length > 0) {
      const [lat, lng] = firstSeg.coords[0]
      added.push(L.circleMarker([lat, lng], {
        radius: 8, fillColor: '#10B981', fillOpacity: 1,
        color: '#064E3B', weight: 2, interactive: false,
        className: 'route-dot-pulse',
      }).addTo(map))
    }

    if (lastFloorNum === activeFloor && lastSeg.coords.length > 0) {
      const [lat, lng] = lastSeg.coords[lastSeg.coords.length - 1]
      added.push(L.circleMarker([lat, lng], {
        radius: 8, fillColor: '#EF4444', fillOpacity: 1,
        color: '#7F1D1D', weight: 2, interactive: false,
      }).addTo(map))
    }

    // Floor-change indicators between segments
    for (let i = 0; i < segments.length - 1; i++) {
      const fromSeg = segments[i]
      const toSeg   = segments[i + 1]
      const fromNum = FLOOR_STR_TO_NUM[fromSeg.floor] ?? 0
      const toNum   = FLOOR_STR_TO_NUM[toSeg.floor] ?? 0
      if (fromNum === activeFloor && fromSeg.coords.length > 0) {
        const [lat, lng] = fromSeg.coords[fromSeg.coords.length - 1]
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:linear-gradient(135deg,#1D4ED8,#7C3AED);color:white;border-radius:8px;padding:2px 8px;font-size:10px;font-weight:700;border:1px solid rgba(96,165,250,0.6);box-shadow:0 2px 8px rgba(0,0,0,0.4);white-space:nowrap;">
            ${toNum > fromNum ? '↑' : '↓'} Floor ${toSeg.floor} 🪜
          </div>`,
          iconAnchor: [40, 8],
        })
        added.push(L.marker([lat, lng], { icon, interactive: false }).addTo(map))
      }
    }

    layersRef.current = added

    // Fit map to show all route coords
    try {
      const allCoords = segments.flatMap(s => s.coords)
      if (allCoords.length > 1) {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [70, 70], maxZoom: 20 })
      }
    } catch {}

    return () => {
      layersRef.current.forEach(l => { try { map.removeLayer(l) } catch {} })
      layersRef.current = []
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeData, activeFloor])

  return null
}
