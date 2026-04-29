/**
 * GEHU Campus Floor GeoJSON Map Data
 * 
 * Format mirrors navit's data structure exactly:
 * Array of floor objects: { floor: "0", map: GeoJSON FeatureCollection }
 * 
 * Center coordinates: [30.2734504, 77.9997427] (lat, lng)
 * GeoJSON uses [lng, lat]
 * 
 * Room polygons are drawn around GEHU Main Academic Block.
 * These are representative polygons based on the actual building layout.
 */

const BASE_LNG = 77.9997427;
const BASE_LAT = 30.2734504;

// Helper: create a rectangle polygon in GeoJSON format
function rect(centerLng, centerLat, wDeg, hDeg) {
  const hw = wDeg / 2, hh = hDeg / 2;
  return {
    type: 'Polygon',
    coordinates: [[
      [centerLng - hw, centerLat - hh],
      [centerLng + hw, centerLat - hh],
      [centerLng + hw, centerLat + hh],
      [centerLng - hw, centerLat + hh],
      [centerLng - hw, centerLat - hh],
    ]]
  };
}

// Unit sizes in degrees (~1m ≈ 0.000009 lat, 0.00001 lng at this location)
const M = 0.000009; // 1 meter in degrees

function roomFeature(roomId, name, type, centerLng, centerLat, widthM = 8, heightM = 6) {
  return {
    type: 'Feature',
    properties: { room_id: roomId, name, type },
    geometry: rect(centerLng, centerLat, widthM * M * 1.1, heightM * M),
  };
}

function corridorFeature(id, points) {
  return {
    type: 'Feature',
    properties: { room_id: id, name: 'Corridor', type: 'corridor' },
    geometry: {
      type: 'LineString',
      coordinates: points
    }
  };
}

// ============================================================
// GROUND FLOOR (floor: "0")
// ============================================================
const groundFeatures = [
  // Main corridor
  corridorFeature('G_CORR', [
    [BASE_LNG - 0.0006, BASE_LAT],
    [BASE_LNG + 0.0006, BASE_LAT],
  ]),
  // Cross corridors
  corridorFeature('G_CORR2', [
    [BASE_LNG - 0.0002, BASE_LAT - 0.0003],
    [BASE_LNG - 0.0002, BASE_LAT + 0.0003],
  ]),
  corridorFeature('G_CORR3', [
    [BASE_LNG + 0.0002, BASE_LAT - 0.0003],
    [BASE_LNG + 0.0002, BASE_LAT + 0.0003],
  ]),

  roomFeature(1001, 'CR101', 'class',         BASE_LNG - 0.0006, BASE_LAT + 0.00015, 8, 6),
  roomFeature(1002, 'CR102', 'class',         BASE_LNG - 0.0004, BASE_LAT + 0.00015, 8, 6),
  roomFeature(1003, 'CR103', 'class',         BASE_LNG - 0.0002, BASE_LAT + 0.00015, 8, 6),
  roomFeature(1004, 'CR104', 'class',         BASE_LNG,           BASE_LAT + 0.00015, 8, 6),
  roomFeature(1005, 'CR105', 'class',         BASE_LNG + 0.0002, BASE_LAT + 0.00015, 8, 6),
  roomFeature(1006, 'CR106', 'class',         BASE_LNG + 0.0004, BASE_LAT + 0.00015, 8, 6),
  roomFeature(1011, 'Teacher\'s Room', 'staffroom', BASE_LNG - 0.0006, BASE_LAT - 0.00015, 8, 5),
  roomFeature(1012, 'Gents Washroom', 'gentswashroom', BASE_LNG - 0.0004, BASE_LAT - 0.00015, 5, 4),
  roomFeature(1013, 'Ladies Washroom', 'ladieswashroom', BASE_LNG - 0.0003, BASE_LAT - 0.00015, 5, 4),
  roomFeature(1014, 'Staff Room G1', 'staffroom', BASE_LNG - 0.0002, BASE_LAT - 0.00015, 7, 5),
  roomFeature(1015, 'Staff Room G2', 'staffroom', BASE_LNG, BASE_LAT - 0.00015, 7, 5),
  roomFeature(1016, 'Bosch Lab', 'lab',       BASE_LNG + 0.0002, BASE_LAT - 0.00015, 9, 6),
  roomFeature(1017, 'Teacher\'s Cabin', 'office', BASE_LNG + 0.0004, BASE_LAT - 0.00015, 6, 4),
  roomFeature(1018, 'LAB1', 'lab',            BASE_LNG + 0.0005, BASE_LAT + 0.00015, 7, 5),
  roomFeature(1019, 'HOD Office', 'office',   BASE_LNG + 0.0006, BASE_LAT + 0.00015, 6, 4),
  roomFeature(1021, 'Open Auditorium', 'other', BASE_LNG - 0.0005, BASE_LAT, 10, 8),
  roomFeature(1022, 'Meeting Hall', 'other',  BASE_LNG - 0.0001, BASE_LAT - 0.0003, 7, 6),
  roomFeature(1023, 'Seminar Hall', 'other',  BASE_LNG + 0.0001, BASE_LAT - 0.0003, 12, 8),
  roomFeature(1024, 'Main Office', 'office',  BASE_LNG + 0.0005, BASE_LAT - 0.00015, 7, 5),
  roomFeature(1025, 'Library Sitting Area', 'library', BASE_LNG + 0.0003, BASE_LAT - 0.0003, 9, 6),
  roomFeature(1026, 'Mac Lab', 'computerlab', BASE_LNG - 0.0001, BASE_LAT + 0.0003, 8, 6),
  roomFeature(1027, 'Medical Room', 'other',  BASE_LNG + 0.0001, BASE_LAT + 0.0003, 6, 4),
  roomFeature(1028, 'ULI', 'lab',            BASE_LNG - 0.0005, BASE_LAT - 0.0003, 8, 6),
  roomFeature(1029, 'ULII', 'lab',           BASE_LNG - 0.0003, BASE_LAT - 0.0003, 8, 6),
  roomFeature(1998, 'Ladies Washroom G', 'ladieswashroom', BASE_LNG + 0.0003, BASE_LAT + 0.00025, 5, 4),
  roomFeature(1999, 'Gents Washroom G', 'gentswashroom', BASE_LNG + 0.0004, BASE_LAT + 0.00025, 5, 4),
];

// ============================================================
// FLOOR 1 (floor: "1")
// ============================================================
const floor1Features = [
  corridorFeature('F1_CORR', [
    [BASE_LNG - 0.0006, BASE_LAT],
    [BASE_LNG + 0.0006, BASE_LAT],
  ]),
  roomFeature(2001, 'CR201', 'class',       BASE_LNG - 0.0006, BASE_LAT + 0.00015, 8, 6),
  roomFeature(2002, 'CR202', 'class',       BASE_LNG - 0.0004, BASE_LAT + 0.00015, 8, 6),
  roomFeature(2003, 'CR203', 'class',       BASE_LNG - 0.0002, BASE_LAT + 0.00015, 8, 6),
  roomFeature(2004, 'CR204', 'class',       BASE_LNG,           BASE_LAT + 0.00015, 8, 6),
  roomFeature(2005, 'CR205', 'class',       BASE_LNG + 0.0002, BASE_LAT + 0.00015, 8, 6),
  roomFeature(2006, 'CR206', 'class',       BASE_LNG + 0.0004, BASE_LAT + 0.00015, 8, 6),
  roomFeature(2007, 'CR207', 'class',       BASE_LNG + 0.0006, BASE_LAT + 0.00015, 8, 6),
  roomFeature(2011, 'LT201', 'class',       BASE_LNG - 0.0005, BASE_LAT - 0.00015, 14, 8),
  roomFeature(2012, 'LT202', 'class',       BASE_LNG + 0.0003, BASE_LAT - 0.00015, 14, 8),
  roomFeature(2013, 'TCL Lab 1', 'computerlab', BASE_LNG - 0.0006, BASE_LAT - 0.0003, 8, 6),
  roomFeature(2014, 'TCL Lab 2', 'computerlab', BASE_LNG - 0.0004, BASE_LAT - 0.0003, 8, 6),
  roomFeature(2015, 'TCL Lab 3', 'computerlab', BASE_LNG - 0.0002, BASE_LAT - 0.0003, 8, 6),
  roomFeature(2016, 'TCL Lab 4', 'computerlab', BASE_LNG,           BASE_LAT - 0.0003, 8, 6),
  roomFeature(2017, 'Staff Room 1', 'staffroom', BASE_LNG + 0.0002, BASE_LAT - 0.0003, 7, 5),
  roomFeature(2018, 'Server Room', 'other', BASE_LNG + 0.0004, BASE_LAT - 0.0003, 6, 5),
  roomFeature(2019, 'Ladies Washroom 1', 'ladieswashroom', BASE_LNG + 0.0005, BASE_LAT - 0.0003, 5, 4),
  roomFeature(2020, 'Gents Washroom 1', 'gentswashroom', BASE_LNG + 0.0006, BASE_LAT - 0.0003, 5, 4),
  roomFeature(2021, 'School of Pharmacy Lab', 'lab', BASE_LNG - 0.0006, BASE_LAT - 0.00045, 9, 6),
  roomFeature(2022, 'ERP Cell', 'office', BASE_LNG - 0.0004, BASE_LAT - 0.00045, 6, 5),
  roomFeature(2023, 'Library Main', 'library', BASE_LNG - 0.0001, BASE_LAT + 0.0003, 14, 10),
  roomFeature(2024, 'President Office', 'office', BASE_LNG + 0.0005, BASE_LAT + 0.00025, 6, 4),
  roomFeature(2025, 'Vice Chancellor Office', 'office', BASE_LNG + 0.0006, BASE_LAT + 0.00025, 7, 4),
  roomFeature(2026, 'Teacher Office 1', 'staffroom', BASE_LNG + 0.0003, BASE_LAT + 0.0003, 7, 5),
];

// ============================================================
// FLOOR 2 (floor: "2")
// ============================================================
const floor2Features = [
  corridorFeature('F2_CORR', [
    [BASE_LNG - 0.0006, BASE_LAT],
    [BASE_LNG + 0.0006, BASE_LAT],
  ]),
  roomFeature(3001, 'CR301', 'class',       BASE_LNG - 0.0006, BASE_LAT + 0.00015, 8, 6),
  roomFeature(3002, 'LT302', 'class',       BASE_LNG - 0.0003, BASE_LAT + 0.00015, 14, 8),
  roomFeature(3003, 'CR303', 'class',       BASE_LNG + 0.0002, BASE_LAT + 0.00015, 8, 6),
  roomFeature(3004, 'CR304', 'class',       BASE_LNG + 0.0004, BASE_LAT + 0.00015, 8, 6),
  roomFeature(3011, 'Ladies Washroom 2', 'ladieswashroom', BASE_LNG + 0.0005, BASE_LAT + 0.00025, 5, 4),
  roomFeature(3012, 'Gents Washroom 2', 'gentswashroom', BASE_LNG + 0.0006, BASE_LAT + 0.00025, 5, 4),
];

// ============================================================
// FLOOR 3 (floor: "3")
// ============================================================
const floor3Features = [
  corridorFeature('F3_CORR', [
    [BASE_LNG - 0.0006, BASE_LAT],
    [BASE_LNG + 0.0006, BASE_LAT],
  ]),
  roomFeature(4001, 'Cafeteria / Mess', 'cafeteria', BASE_LNG - 0.0004, BASE_LAT + 0.0002, 20, 12),
  roomFeature(4002, 'Tuck Shop', 'other',   BASE_LNG + 0.0002, BASE_LAT + 0.0002, 6, 5),
  roomFeature(4003, 'Teacher Dining Area', 'other', BASE_LNG + 0.0004, BASE_LAT + 0.0002, 8, 6),
  roomFeature(4004, 'Fee Cell', 'office',   BASE_LNG - 0.0006, BASE_LAT - 0.00015, 7, 5),
  roomFeature(4005, 'Registrar Office', 'office', BASE_LNG - 0.0004, BASE_LAT - 0.00015, 7, 5),
  roomFeature(4006, 'Degree & Certificates', 'office', BASE_LNG - 0.0002, BASE_LAT - 0.00015, 7, 5),
  roomFeature(4007, 'CCTV Room', 'other',   BASE_LNG, BASE_LAT - 0.00015, 5, 4),
  roomFeature(4008, 'Exam Controller', 'office', BASE_LNG + 0.0002, BASE_LAT - 0.00015, 7, 5),
  roomFeature(4009, 'Workshop', 'lab',      BASE_LNG + 0.0004, BASE_LAT - 0.00015, 10, 7),
  roomFeature(4010, 'Civil Engineering Lab', 'lab', BASE_LNG + 0.0006, BASE_LAT - 0.00015, 9, 6),
];

// ============================================================
// FLOOR 4 (floor: "4")
// ============================================================
const floor4Features = [
  corridorFeature('F4_CORR', [
    [BASE_LNG - 0.0006, BASE_LAT],
    [BASE_LNG + 0.0006, BASE_LAT],
  ]),
  roomFeature(5001, 'CR401', 'class',       BASE_LNG - 0.0006, BASE_LAT + 0.00015, 8, 6),
  roomFeature(5002, 'CR402', 'class',       BASE_LNG - 0.0004, BASE_LAT + 0.00015, 8, 6),
  roomFeature(5003, 'CR403', 'class',       BASE_LNG - 0.0002, BASE_LAT + 0.00015, 8, 6),
  roomFeature(5004, 'CR404', 'class',       BASE_LNG,           BASE_LAT + 0.00015, 8, 6),
  roomFeature(5005, 'CR405', 'class',       BASE_LNG + 0.0002, BASE_LAT + 0.00015, 8, 6),
  roomFeature(5006, 'CR406', 'class',       BASE_LNG + 0.0004, BASE_LAT + 0.00015, 8, 6),
  roomFeature(5011, 'Electronic Engg Lab II', 'lab', BASE_LNG - 0.0006, BASE_LAT - 0.00015, 9, 6),
  roomFeature(5012, 'Logic Design Microprocessor Lab', 'lab', BASE_LNG - 0.0003, BASE_LAT - 0.00015, 11, 6),
  roomFeature(5013, 'Dean Academics Office', 'office', BASE_LNG + 0.0002, BASE_LAT - 0.00015, 7, 5),
  roomFeature(5014, 'Ladies Washroom 4', 'ladieswashroom', BASE_LNG + 0.0005, BASE_LAT + 0.00025, 5, 4),
  roomFeature(5015, 'Gents Washroom 4', 'gentswashroom', BASE_LNG + 0.0006, BASE_LAT + 0.00025, 5, 4),
];

// ============================================================
// FLOOR 5 (floor: "5")
// ============================================================
const floor5Features = [
  corridorFeature('F5_CORR', [
    [BASE_LNG - 0.0006, BASE_LAT],
    [BASE_LNG + 0.0006, BASE_LAT],
  ]),
  roomFeature(6001, 'CR501', 'class',       BASE_LNG - 0.0006, BASE_LAT + 0.00015, 8, 6),
  roomFeature(6002, 'CR502', 'class',       BASE_LNG - 0.0004, BASE_LAT + 0.00015, 8, 6),
  roomFeature(6003, 'CR503', 'class',       BASE_LNG - 0.0002, BASE_LAT + 0.00015, 8, 6),
  roomFeature(6004, 'CR504', 'class',       BASE_LNG,           BASE_LAT + 0.00015, 8, 6),
  roomFeature(6011, 'Ladies Washroom 5', 'ladieswashroom', BASE_LNG + 0.0005, BASE_LAT + 0.00025, 5, 4),
  roomFeature(6012, 'Gents Washroom 5', 'gentswashroom', BASE_LNG + 0.0006, BASE_LAT + 0.00025, 5, 4),
];

// ============================================================
// BASEMENT (floor: "-1")
// ============================================================
const basementFeatures = [
  corridorFeature('B_CORR', [
    [BASE_LNG - 0.0006, BASE_LAT],
    [BASE_LNG + 0.0006, BASE_LAT],
  ]),
  roomFeature(100, 'Basement Parking', 'other', BASE_LNG - 0.0003, BASE_LAT, 20, 15),
  roomFeature(101, 'Basement Store', 'other', BASE_LNG + 0.0003, BASE_LAT, 12, 8),
];

// ============================================================
// EXPORT: navit-compatible floor map data
// ============================================================
const floorMapData = [
  { floor: '-1', map: { type: 'FeatureCollection', features: basementFeatures } },
  { floor: '0',  map: { type: 'FeatureCollection', features: groundFeatures } },
  { floor: '1',  map: { type: 'FeatureCollection', features: floor1Features } },
  { floor: '2',  map: { type: 'FeatureCollection', features: floor2Features } },
  { floor: '3',  map: { type: 'FeatureCollection', features: floor3Features } },
  { floor: '4',  map: { type: 'FeatureCollection', features: floor4Features } },
  { floor: '5',  map: { type: 'FeatureCollection', features: floor5Features } },
];

module.exports = floorMapData;
