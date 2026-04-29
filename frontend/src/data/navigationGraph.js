// UniPath — Campus Navigation Graph
// Real coordinates: GEHU Dehradun Campus
// Campus center (from OSM): 30.2734504, 77.9997427

// The main academic block runs NW→SE, tilted ~40° clockwise
// Origin placed at SW corner of the main block
const X0 = 77.9988   // West edge of main block (lng)
const Y0 = 30.2728   // South edge of main block (lat)
const dx = 0.00022   // ~20m per column step
const dy = 0.00018   // ~20m per row step
const angle = -38 * (Math.PI / 180) // Align grid with building orientation

const n = (floor, col, row) => {
  const ox = (col + 0.5) * dx
  const oy = (row + 0.5) * dy
  const rx = ox * Math.cos(angle) - oy * Math.sin(angle)
  const ry = ox * Math.sin(angle) + oy * Math.cos(angle)
  return {
    lat: Y0 + ry,
    lng: X0 + rx,
    floor: String(floor),
  }
}

// Staircase A: left/west side of building
const STAIR_A_LNG = X0 + 2.0*dx
const STAIR_A_LAT = Y0 + 2.5*dy
// Staircase B: right/east side of building  
const STAIR_B_LNG = X0 + 6.5*dx
const STAIR_B_LAT = Y0 + 2.5*dy

export const NAV_NODES = {
  // ── STAIRCASE A (west wing) ───────────────────────────────────
  stair_A_B: { lat: STAIR_A_LAT, lng: STAIR_A_LNG, floor:'-1' },
  stair_A_0: { lat: STAIR_A_LAT, lng: STAIR_A_LNG, floor:'0' },
  stair_A_1: { lat: STAIR_A_LAT, lng: STAIR_A_LNG, floor:'1' },
  stair_A_2: { lat: STAIR_A_LAT, lng: STAIR_A_LNG, floor:'2' },
  stair_A_3: { lat: STAIR_A_LAT, lng: STAIR_A_LNG, floor:'3' },
  stair_A_4: { lat: STAIR_A_LAT, lng: STAIR_A_LNG, floor:'4' },
  stair_A_5: { lat: STAIR_A_LAT, lng: STAIR_A_LNG, floor:'5' },
  stair_A_6: { lat: STAIR_A_LAT, lng: STAIR_A_LNG, floor:'6' },

  // ── STAIRCASE B (east wing) ───────────────────────────────────
  stair_B_B: { lat: STAIR_B_LAT, lng: STAIR_B_LNG, floor:'-1' },
  stair_B_0: { lat: STAIR_B_LAT, lng: STAIR_B_LNG, floor:'0' },
  stair_B_1: { lat: STAIR_B_LAT, lng: STAIR_B_LNG, floor:'1' },
  stair_B_2: { lat: STAIR_B_LAT, lng: STAIR_B_LNG, floor:'2' },
  stair_B_3: { lat: STAIR_B_LAT, lng: STAIR_B_LNG, floor:'3' },
  stair_B_4: { lat: STAIR_B_LAT, lng: STAIR_B_LNG, floor:'4' },
  stair_B_5: { lat: STAIR_B_LAT, lng: STAIR_B_LNG, floor:'5' },
  stair_B_6: { lat: STAIR_B_LAT, lng: STAIR_B_LNG, floor:'6' },

  // ── BASEMENT (-1) ─────────────────────────────────────────────
  jB_mid: n('-1', 4, 1),
  '177':  n('-1', 1, 1), // Parking
  '4':    n('-1', 3, 1), // Exam Controller

  // ── GROUND FLOOR (0) — classroom corridor runs NW along top ───
  // Central junction (main hallway midpoint)
  j0_mid: n('0', 4, 2),
  // Classroom wing (NW side, col 1–7)
  '1036': n('0', 1, 1), // CR101
  '1075': n('0', 2, 1), // CR102
  '1071': n('0', 3, 1), // CR103
  '1085': n('0', 5, 1), // CR104
  '1087': n('0', 6, 1), // CR105
  '1089': n('0', 7, 1), // CR106
  // Labs / facilities (SE side)
  '1031': n('0', 2, 3), // Seminar Hall
  '1033': n('0', 3, 3), // Bosch Lab
  '1001': n('0', 4, 3), // Ubuntu Lab 1
  '1003': n('0', 5, 3), // Ubuntu Lab 2
  '1006': n('0', 6, 3), // Mac Lab
  '1069': n('0', 7, 3), // Lab 1
  // Library on far right
  '1105': n('0', 8, 2), // Library
  // Admin/other
  '1091': n('0', 7, 2), // HOD Office
  '1166': n('0', 0, 2), // Canteen

  // ── FLOOR 1 (1) ───────────────────────────────────────────────
  j1_mid: n('1',4,1),
  '2075': n('1',1,1), // CR201
  '2071': n('1',2,1), // CR202
  '2085': n('1',3,1), // CR203
  '2087': n('1',5,1), // CR204
  '2089': n('1',6,1), // CR205
  '2033': n('1',7,1), // CR206
  '2036': n('1',8,1), // CR207
  '2041': n('1',1,2), // LT201
  '2031': n('1',2,2), // LT202
  '2069': n('1',3,2), // Lab 2
  '2119': n('1',4,2), // Library Main

  // ── FLOOR 2 (2) ───────────────────────────────────────────────
  j2_mid: n('2',4,1),
  '3033': n('2',1,1), // CR301
  '3017': n('2',2,1), // CR302
  '3025': n('2',3,1), // CR303
  '3006': n('2',5,1), // CR304
  '3036': n('2',6,1), // CR305
  '3041': n('2',1,2), // LT301
  '3031': n('2',2,2), // LT302
  '3069': n('2',3,2), // Lab 3

  // ── FLOOR 3 (3) ───────────────────────────────────────────────
  j3_mid: n('3',4,1),
  '4075': n('3',1,1), // CR401
  '4089': n('3',2,1), // CR402
  '4033': n('3',3,1), // CR403
  '4025': n('3',5,1), // CR404
  '4006': n('3',6,1), // CR405
  '4036': n('3',7,1), // CR406
  '4031': n('3',1,2), // LT401
  '4041': n('3',2,2), // LT402
  '4069': n('3',3,2), // Lab 4

  // ── FLOOR 4 (4) ───────────────────────────────────────────────
  j4_mid: n('4',4,1),
  '5075': n('4',1,1), // CR501
  '5089': n('4',2,1), // CR502
  '5033': n('4',3,1), // CR503
  '5036': n('4',5,1), // CR504
  '5031': n('4',1,2), // LT501
  '5041': n('4',2,2), // LT502
  '5069': n('4',3,2), // Lab 5

  // ── FLOOR 5 (5) ───────────────────────────────────────────────
  j5_mid: n('5',4,1),
  '6075': n('5',1,1), // CR601
  '6071': n('5',2,1), // CR602
  '6085': n('5',3,1), // CR603
  '6089': n('5',5,1), // CR604
  '6033': n('5',6,1), // CR605
  '6031': n('5',1,2), // LT601
  '6041': n('5',2,2), // LT602
  '6069': n('5',3,2), // Lab 6
  '6003': n('5',4,2), // K P Nautiyal Audi

  // ── FLOOR 6 (6) ───────────────────────────────────────────────
  j6_mid: n('6',4,1),
}

// Map each floor's junction to its rooms and stairs
export const NAV_EDGES = {
  // Vertical connections
  stair_A_B: ['stair_A_0'],
  stair_A_0: ['stair_A_B', 'stair_A_1', 'j0_mid'],
  stair_A_1: ['stair_A_0', 'stair_A_2', 'j1_mid'],
  stair_A_2: ['stair_A_1', 'stair_A_3', 'j2_mid'],
  stair_A_3: ['stair_A_2', 'stair_A_4', 'j3_mid'],
  stair_A_4: ['stair_A_3', 'stair_A_5', 'j4_mid'],
  stair_A_5: ['stair_A_4', 'stair_A_6', 'j5_mid'],
  stair_A_6: ['stair_A_5', 'j6_mid'],

  stair_B_B: ['stair_B_0'],
  stair_B_0: ['stair_B_B', 'stair_B_1', 'j0_mid'],
  stair_B_1: ['stair_B_0', 'stair_B_2', 'j1_mid'],
  stair_B_2: ['stair_B_1', 'stair_B_3', 'j2_mid'],
  stair_B_3: ['stair_B_2', 'stair_B_4', 'j3_mid'],
  stair_B_4: ['stair_B_3', 'stair_B_5', 'j4_mid'],
  stair_B_5: ['stair_B_4', 'stair_B_6', 'j5_mid'],
  stair_B_6: ['stair_B_5', 'j6_mid'],

  // Basement connections
  jB_mid: ['177', '4', 'stair_A_B', 'stair_B_B'],
  '177':  ['jB_mid'], '4': ['jB_mid'],

  // Ground connections
  j0_mid: ['1166', '1036', '1075', '1071', '1085', '1087', '1089', '1031', '1033', '1105', '1001', '1003', '1006', '1091', '1069', 'stair_A_0', 'stair_B_0'],
  '1166':['j0_mid'], '1036':['j0_mid'], '1075':['j0_mid'], '1071':['j0_mid'], '1085':['j0_mid'], '1087':['j0_mid'], '1089':['j0_mid'], '1031':['j0_mid'], '1033':['j0_mid'], '1105':['j0_mid'], '1001':['j0_mid'], '1003':['j0_mid'], '1006':['j0_mid'], '1091':['j0_mid'], '1069':['j0_mid'],

  // Floor 1
  j1_mid: ['2075', '2071', '2085', '2087', '2089', '2033', '2036', '2041', '2031', '2069', '2119', 'stair_A_1', 'stair_B_1'],
  '2075':['j1_mid'], '2071':['j1_mid'], '2085':['j1_mid'], '2087':['j1_mid'], '2089':['j1_mid'], '2033':['j1_mid'], '2036':['j1_mid'], '2041':['j1_mid'], '2031':['j1_mid'], '2069':['j1_mid'], '2119':['j1_mid'],

  // Floor 2
  j2_mid: ['3033', '3017', '3025', '3006', '3036', '3041', '3031', '3069', 'stair_A_2', 'stair_B_2'],
  '3033':['j2_mid'], '3017':['j2_mid'], '3025':['j2_mid'], '3006':['j2_mid'], '3036':['j2_mid'], '3041':['j2_mid'], '3031':['j2_mid'], '3069':['j2_mid'],

  // Floor 3
  j3_mid: ['4075', '4089', '4033', '4025', '4006', '4036', '4031', '4041', '4069', 'stair_A_3', 'stair_B_3'],
  '4075':['j3_mid'], '4089':['j3_mid'], '4033':['j3_mid'], '4025':['j3_mid'], '4006':['j3_mid'], '4036':['j3_mid'], '4031':['j3_mid'], '4041':['j3_mid'], '4069':['j3_mid'],

  // Floor 4
  j4_mid: ['5075', '5089', '5033', '5036', '5031', '5041', '5069', 'stair_A_4', 'stair_B_4'],
  '5075':['j4_mid'], '5089':['j4_mid'], '5033':['j4_mid'], '5036':['j4_mid'], '5031':['j4_mid'], '5041':['j4_mid'], '5069':['j4_mid'],

  // Floor 5
  j5_mid: ['6075', '6071', '6085', '6089', '6033', '6031', '6041', '6069', '6003', 'stair_A_5', 'stair_B_5'],
  '6075':['j5_mid'], '6071':['j5_mid'], '6085':['j5_mid'], '6089':['j5_mid'], '6033':['j5_mid'], '6031':['j5_mid'], '6041':['j5_mid'], '6069':['j5_mid'], '6003':['j5_mid'],

  // Floor 6
  j6_mid: ['stair_A_6', 'stair_B_6'],
}
