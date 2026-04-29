import { useEffect } from 'react'
import { useMap as useLeafletMap } from 'react-leaflet'

// This component handles map-level side effects
export default function MapController({ center, zoom }) {
  const map = useLeafletMap()
  useEffect(() => {
    if (center) map.setView(center, zoom || map.getZoom())
  }, [center])
  return null
}
