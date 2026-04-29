/**
 * GEHU Campus Path Data — A* Navigation Graph
 * 
 * Node IDs correspond to waypoints in corridors.
 * Room IDs are endpoints that connect to the nearest corridor node.
 * 
 * Coordinate format: [lng, lat] (GeoJSON standard)
 * 
 * The graph is structured as:
 * nodes: { id: [lng, lat] }
 * edges: [[nodeA, nodeB, distance], ...]
 * roomToNode: { roomid: closestNodeId }
 * 
 * Based on GEHU Dehradun main academic building layout.
 * Center: approx [77.9997427, 30.2734504]
 */

// ============================================================
// WAYPOINT NODES — corridor intersections and staircase landings
// Each floor has nodes with prefix: B=basement, G=ground, F1-F5=floors
// ============================================================

const nodes = {
  // Ground Floor Corridor
  G01: [77.9994, 30.2735],
  G02: [77.9995, 30.2735],
  G03: [77.9996, 30.2735],
  G04: [77.9997, 30.2735],
  G05: [77.9998, 30.2735],
  G06: [77.9999, 30.2735],
  G07: [78.0000, 30.2735],
  G08: [78.0001, 30.2735],

  // Ground Floor cross corridor (N-S)
  GC1: [77.9995, 30.2736],
  GC2: [77.9995, 30.2734],
  GC3: [77.9997, 30.2736],
  GC4: [77.9997, 30.2734],
  GC5: [77.9999, 30.2736],
  GC6: [77.9999, 30.2734],

  // Staircase nodes (shared between floors)
  S1_G: [77.9995, 30.2735], // Stair 1 Ground
  S2_G: [77.9999, 30.2735], // Stair 2 Ground

  // Floor 1 Corridor
  F1_01: [77.9994, 30.2735],
  F1_02: [77.9995, 30.2735],
  F1_03: [77.9996, 30.2735],
  F1_04: [77.9997, 30.2735],
  F1_05: [77.9998, 30.2735],
  F1_06: [77.9999, 30.2735],
  F1_07: [78.0000, 30.2735],

  // Floor 2 Corridor
  F2_01: [77.9994, 30.2735],
  F2_02: [77.9995, 30.2735],
  F2_03: [77.9996, 30.2735],
  F2_04: [77.9997, 30.2735],
  F2_05: [77.9999, 30.2735],

  // Floor 3
  F3_01: [77.9994, 30.2735],
  F3_02: [77.9996, 30.2735],
  F3_03: [77.9998, 30.2735],
  F3_04: [78.0000, 30.2735],

  // Floor 4
  F4_01: [77.9994, 30.2735],
  F4_02: [77.9996, 30.2735],
  F4_03: [77.9998, 30.2735],
  F4_04: [78.0000, 30.2735],

  // Floor 5
  F5_01: [77.9994, 30.2735],
  F5_02: [77.9996, 30.2735],
  F5_03: [77.9998, 30.2735],

  // Basement
  B01: [77.9995, 30.2735],
  B02: [77.9997, 30.2735],
  B03: [77.9999, 30.2735],
};

// Distance between two [lng,lat] points in meters (Haversine)
function haversine(a, b) {
  const R = 6371000;
  const phi1 = a[1] * Math.PI / 180;
  const phi2 = b[1] * Math.PI / 180;
  const dphi = (b[1] - a[1]) * Math.PI / 180;
  const dlambda = (b[0] - a[0]) * Math.PI / 180;
  const x = Math.sin(dphi/2)**2 + Math.cos(phi1)*Math.cos(phi2)*Math.sin(dlambda/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

// ============================================================
// EDGES — corridor connections + stair connections (cross-floor)
// ============================================================
const rawEdges = [
  // Ground floor main corridor
  ['G01','G02'], ['G02','G03'], ['G03','G04'], ['G04','G05'], ['G05','G06'], ['G06','G07'], ['G07','G08'],
  // Ground cross corridors
  ['G02','GC1'], ['G02','GC2'],
  ['G04','GC3'], ['G04','GC4'],
  ['G06','GC5'], ['G06','GC6'],
  // Staircase to Floor 1 (stair costs ~12m per floor)
  ['G02','F1_02'], ['G06','F1_06'],
  // Floor 1 corridor
  ['F1_01','F1_02'], ['F1_02','F1_03'], ['F1_03','F1_04'], ['F1_04','F1_05'], ['F1_05','F1_06'], ['F1_06','F1_07'],
  // Staircase Floor 1 → 2
  ['F1_02','F2_02'], ['F1_06','F2_05'],
  // Floor 2
  ['F2_01','F2_02'], ['F2_02','F2_03'], ['F2_03','F2_04'], ['F2_04','F2_05'],
  // Staircase Floor 2 → 3
  ['F2_02','F3_01'], ['F2_05','F3_03'],
  // Floor 3
  ['F3_01','F3_02'], ['F3_02','F3_03'], ['F3_03','F3_04'],
  // Staircase Floor 3 → 4
  ['F3_01','F4_01'], ['F3_03','F4_03'],
  // Floor 4
  ['F4_01','F4_02'], ['F4_02','F4_03'], ['F4_03','F4_04'],
  // Staircase Floor 4 → 5
  ['F4_01','F5_01'], ['F4_03','F5_02'],
  // Floor 5
  ['F5_01','F5_02'], ['F5_02','F5_03'],
  // Basement
  ['G02','B01'], ['B01','B02'], ['B02','B03'],
];

// Build adjacency list with distances
const adjacency = {};
for (const key of Object.keys(nodes)) adjacency[key] = [];

for (const [a, b] of rawEdges) {
  if (!nodes[a] || !nodes[b]) continue;
  // Stair/cross-floor edges get a penalty of 15m
  const isCrossFloor = a.split('_')[0] !== b.split('_')[0] &&
    !(a.startsWith('G') && b.startsWith('G')) &&
    !(a.startsWith('B') && b.startsWith('B'));
  const dist = isCrossFloor ? 15 : haversine(nodes[a], nodes[b]);
  adjacency[a].push({ node: b, dist });
  adjacency[b].push({ node: a, dist });
}

// ============================================================
// ROOM → NEAREST NODE MAPPING
// ============================================================
const roomToNode = {
  // Ground floor
  1001: 'G01', 1002: 'G02', 1003: 'GC2', 1004: 'G03', 1005: 'GC1', 1006: 'G04',
  1011: 'G04', 1012: 'GC4', 1013: 'GC3', 1014: 'G05', 1015: 'G06',
  1016: 'GC5', 1017: 'G07', 1018: 'GC6', 1019: 'G08', 1020: 'G08',
  1021: 'G01', 1022: 'G02', 1023: 'G03', 1024: 'GC2', 1025: 'GC4',
  1026: 'GC6', 1027: 'G06', 1028: 'G05', 1029: 'G06',
  1998: 'GC3', 1999: 'GC4',
  // Floor 1
  2001: 'F1_01', 2002: 'F1_02', 2003: 'F1_03', 2004: 'F1_04', 2005: 'F1_05',
  2006: 'F1_06', 2007: 'F1_07', 2011: 'F1_03', 2012: 'F1_05',
  2013: 'F1_02', 2014: 'F1_03', 2015: 'F1_04', 2016: 'F1_05',
  2017: 'F1_06', 2018: 'F1_07', 2019: 'F1_04', 2020: 'F1_04',
  2021: 'F1_03', 2022: 'F1_05', 2023: 'F1_06', 2024: 'F1_01', 2025: 'F1_02', 2026: 'F1_03',
  // Floor 2
  3001: 'F2_01', 3002: 'F2_02', 3003: 'F2_03', 3004: 'F2_04',
  3011: 'F2_04', 3012: 'F2_05',
  // Floor 3
  4001: 'F3_01', 4002: 'F3_02', 4003: 'F3_02', 4004: 'F3_03',
  4005: 'F3_03', 4006: 'F3_04', 4007: 'F3_04', 4008: 'F3_03',
  4009: 'F3_02', 4010: 'F3_01',
  // Floor 4
  5001: 'F4_01', 5002: 'F4_01', 5003: 'F4_02', 5004: 'F4_02',
  5005: 'F4_03', 5006: 'F4_04',
  5011: 'F4_02', 5012: 'F4_03', 5013: 'F4_04', 5014: 'F4_03', 5015: 'F4_04',
  // Floor 5
  6001: 'F5_01', 6002: 'F5_01', 6003: 'F5_02', 6004: 'F5_03',
  6011: 'F5_02', 6012: 'F5_03',
  // Basement
  100: 'B01', 101: 'B02',
};

// ============================================================
// A* PATHFINDING
// ============================================================
function heuristic(a, b) {
  return haversine(nodes[a] || [0,0], nodes[b] || [0,0]);
}

function astar(startId, goalId) {
  if (!nodes[startId] || !nodes[goalId]) return null;
  const open = new Map();
  open.set(startId, { g: 0, h: heuristic(startId, goalId), parent: null });
  const closed = new Set();

  while (open.size > 0) {
    // Find lowest f = g + h
    let current = null;
    let lowestF = Infinity;
    for (const [id, val] of open) {
      const f = val.g + val.h;
      if (f < lowestF) { lowestF = f; current = id; }
    }

    const currentData = open.get(current);
    if (current === goalId) {
      // Reconstruct path
      const path = [];
      let node = current;
      const parentMap = new Map();
      // rebuild parent chain
      let cur = current;
      const openCopy = new Map(open);
      const allNodes = new Map();
      allNodes.set(startId, { g: 0, parent: null });
      // We need to retrace - store parents during search
      return { path: tracePath(current, parentMap, startId), distance: currentData.g };
    }

    open.delete(current);
    closed.add(current);

    for (const { node: neighborId, dist } of (adjacency[current] || [])) {
      if (closed.has(neighborId)) continue;
      const tentativeG = currentData.g + dist;
      if (!open.has(neighborId) || tentativeG < open.get(neighborId).g) {
        open.set(neighborId, {
          g: tentativeG,
          h: heuristic(neighborId, goalId),
          parent: current,
        });
      }
    }
  }
  return null;
}

// Better A* with proper parent tracking
function astarProper(startId, goalId) {
  if (!nodes[startId] || !nodes[goalId]) return null;

  const gScore = { [startId]: 0 };
  const fScore = { [startId]: heuristic(startId, goalId) };
  const cameFrom = {};
  const openSet = new Set([startId]);
  const closedSet = new Set();

  while (openSet.size > 0) {
    let current = null;
    let lowestF = Infinity;
    for (const id of openSet) {
      if ((fScore[id] ?? Infinity) < lowestF) { lowestF = fScore[id]; current = id; }
    }

    if (current === goalId) {
      const path = [];
      let node = goalId;
      while (node !== undefined) {
        path.unshift(node);
        node = cameFrom[node];
      }
      return { path, distance: gScore[goalId] };
    }

    openSet.delete(current);
    closedSet.add(current);

    for (const { node: neighbor, dist } of (adjacency[current] || [])) {
      if (closedSet.has(neighbor)) continue;
      const tentG = (gScore[current] ?? Infinity) + dist;
      if (tentG < (gScore[neighbor] ?? Infinity)) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentG;
        fScore[neighbor] = tentG + heuristic(neighbor, goalId);
        openSet.add(neighbor);
      }
    }
  }
  return null;
}

// ============================================================
// MAIN EXPORT: getCoordinates(src, des) → antpath + distance
// ============================================================
function getCoordinates(srcRoomId, desRoomId) {
  const srcNode = roomToNode[srcRoomId];
  const desNode = roomToNode[desRoomId];

  if (!srcNode || !desNode) {
    console.warn(`No node mapping for rooms ${srcRoomId} → ${desRoomId}`);
    return { antpath: [[], [], [], [], [], [], []], distance: 0 };
  }

  const result = astarProper(srcNode, desNode);
  if (!result) {
    return { antpath: [[], [], [], [], [], [], []], distance: 0 };
  }

  // Split path into floor buckets [B, G, 1, 2, 3, 4, 5] → indexes 0-6
  // Index = floor + 1 (so floor -1 = index 0, floor 0 = index 1, etc.)
  const antpath = [[], [], [], [], [], [], []];
  
  for (const nodeId of result.path) {
    const coord = nodes[nodeId];
    if (!coord) continue;
    const [lng, lat] = coord;
    const point = [lat, lng]; // Leaflet [lat, lng]
    
    let floorIdx = 1; // default ground floor
    if (nodeId.startsWith('B')) floorIdx = 0;
    else if (nodeId.startsWith('G')) floorIdx = 1;
    else if (nodeId.startsWith('F1')) floorIdx = 2;
    else if (nodeId.startsWith('F2')) floorIdx = 3;
    else if (nodeId.startsWith('F3')) floorIdx = 4;
    else if (nodeId.startsWith('F4')) floorIdx = 5;
    else if (nodeId.startsWith('F5')) floorIdx = 6;

    antpath[floorIdx].push(point);
  }

  return { antpath, distance: result.distance };
}

module.exports = { getCoordinates, nodes, adjacency, roomToNode };
