// pathfinding.js — UniPath
// Uses the real Navit API (https://navit.onrender.com/getCoordinates) for accurate paths.
// The antpath response has 8 slots: [underground, ground, floor1, floor2, ..., floor6]

const NAVIT_API = 'https://navit.onrender.com'

// Floor index in antpath array (0-indexed from underground)
// antpath[0]=underground/basement, antpath[1]=ground, antpath[2]=1st, ... antpath[7]=6th
export const FLOOR_TO_ANTPATH_IDX = {
  '-1': 0,  // basement/underground
  'B':  0,
  '0':  1,  // ground
  'G':  1,
  '1':  2,
  '2':  3,
  '3':  4,
  '4':  5,
  '5':  6,
  '6':  7,
}

export const ANTPATH_IDX_TO_FLOOR = {
  0: '-1',
  1: '0',
  2: '1',
  3: '2',
  4: '3',
  5: '4',
  6: '5',
  7: '6',
}

/**
 * Fetch the real path from Navit's server-side graph database.
 * Returns { segments: [{floor, coords}], distanceM } or null on failure.
 * segments[i].coords is array of [lat, lng] pairs.
 */
export async function fetchNavitPath(srcId, desId) {
  const url = `${NAVIT_API}/getCoordinates?src=${srcId}&des=${desId}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Navit API error: ${res.status}`)
  const json = await res.json()
  if (json.status !== 'success') throw new Error('Navit returned failure status')

  const antpath = json.data.antpath   // array of 8, each is [] or [[lat,lng]...]
  const distanceM = json.data.distance || 0

  // Build segments: only non-empty floors
  const segments = []
  antpath.forEach((floorCoords, idx) => {
    if (!Array.isArray(floorCoords) || floorCoords.length === 0) return
    // Handle nested array: Navit sometimes wraps each floor in an extra array
    const coords = Array.isArray(floorCoords[0]) && Array.isArray(floorCoords[0][0])
      ? floorCoords[0]
      : floorCoords
    if (coords.length < 2) return
    segments.push({
      floor: ANTPATH_IDX_TO_FLOOR[idx] ?? String(idx - 1),
      coords, // [[lat, lng], ...]
    })
  })

  return { segments, distanceM }
}

export function formatWalkTime(distanceM) {
  const secs = distanceM / 1.4
  if (secs < 60) return '~1 min'
  return `~${Math.ceil(secs / 60)} min`
}

// Kept for dropdown fallback (renders rooms from nav graph)
export function getRoomsByFloor() {
  return []
}
