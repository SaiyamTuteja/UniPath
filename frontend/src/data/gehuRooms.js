// GEHU Dehradun campus — real coordinates
// Campus center: 29.9457° N, 78.1642° E
// All [lng, lat] for GeoJSON, all [lat, lng] for Leaflet

const room = (id, name, floor, type, capacity, lngW, latS, lngE, latN) => ({
  type: 'Feature',
  properties: { id, name, floor, type, capacity },
  geometry: {
    type: 'Polygon',
    coordinates: [[[lngW,latN],[lngE,latN],[lngE,latS],[lngW,latS],[lngW,latN]]],
  },
})

// Campus reference anchors (from Google Maps):
// NW: [29.9465, 78.1636]  NE: [29.9463, 78.1652]
// SW: [29.9448, 78.1638]  SE: [29.9445, 78.1650]
// Main block width  ≈ 0.0016° lng  ≈ 130m
// Main block height ≈ 0.0010° lat  ≈  90m
// Grid step x (per room): 0.00018° lng ≈ 14m
// Grid step y (per room): 0.00020° lat ≈ 22m

const X0 = 78.1636  // west edge
const Y0 = 29.9448  // south edge of main block top wing
const dx = 0.00018  // room width
const dy = 0.00020  // room height
const gap = 0.000015 // 1px gap between rooms

const r = (id, name, floor, type, cap, col, row) =>
  room(id, name, floor, type, cap,
    X0 + col*dx + gap,      Y0 + row*dy + gap,
    X0 + (col+1)*dx - gap,  Y0 + (row+1)*dy - gap)

export const GEHU_ROOMS_GEOJSON = {
  type: 'FeatureCollection',
  features: [

    // ══ BASEMENT (B) ═══════════════════════════════════════════
    r('Parking',          'Parking',            'B','parking',   200, 0, 0),
    r('Storage_1',        'Storage A',          'B','other',      50, 1, 0),
    r('Storage_2',        'Storage B',          'B','other',      50, 2, 0),

    // ══ GROUND FLOOR (G) ════════════════════════════════════════
    // Left wing — cafeteria block
    r('Cafe',             'Café / Mess',         'G','cafeteria', 200, 0, 1),
    r('Tuck_Shop',        'Tuck Shop',           'G','cafeteria',  50, 1, 1),
    r('Dining',           'Dining Area',         'G','cafeteria',  80, 2, 1),
    r('Parking_G',        'Parking (G)',         'G','parking',   100, 3, 1),
    // Admin block (center)
    r('Fee_Office',       'Fee Office',          'G','office',     10, 0, 0),
    r('Registrar',        'Registrar Office',    'G','office',     10, 1, 0),
    r('CCTV_Room',        'CCTV Room',           'G','office',      5, 2, 0),
    r('Certs_Room',       'Certificates Room',   'G','office',      5, 3, 0),
    r('Exam_Controller',  'Exam Controller',     'G','office',     10, 4, 0),
    r('Controller_Office','Controller Office',   'G','office',      5, 5, 0),
    // Right wing
    r('Workshop',         'Workshop',            'G','lab',        60, 6, 0),
    r('Civil_Lab',        'Civil Engg Lab',      'G','lab',        40, 7, 0),

    // ══ FLOOR 1 ═════════════════════════════════════════════════
    // Classroom wing (left)
    r('CR101','CR101','1','class',60, 0,2), r('CR102','CR102','1','class',60, 1,2),
    r('CR103','CR103','1','class',60, 2,2), r('CR104','CR104','1','class',60, 3,2),
    r('CR105','CR105','1','class',60, 4,2), r('CR106','CR106','1','class',60, 5,2),
    r('GWR_1', 'Gents Washroom',  '1','gentswashroom', 0, 6,2),
    r('LWR_1', 'Ladies Washroom', '1','ladieswashroom',0, 7,2),
    r('TR_1',  "Teacher's Staff Room",'1','staffroom', 10,8,2),
    // Center hub
    r('SR_G1','Staff Room G1',  '1','staffroom', 20, 0,3),
    r('SR_G2','Staff Room G2',  '1','staffroom', 20, 1,3),
    r('Bosch_Lab','Bosch Lab',  '1','lab',       30, 2,3),
    r('Seminar_Hall','Seminar Hall','1','hall',  150, 3,3),
    r('Open_Audi','Open Auditorium','1','auditorium',300,4,3),
    r('Meeting_Hall','Meeting Hall','1','hall',   80, 5,3),
    // Right / circular section
    r('LWR_1b','Ladies Washroom (Lab)','1','ladieswashroom',0,6,3),
    r('Medical_Room','Medical Room','1','office',  5, 7,3),
    r('Library_Sit','Library Sitting','1','library',100,8,3),
    r('Main_Office','Main Office',  '1','office', 20, 0,4),
    r('Mac_Lab',  'Mac Lab',        '1','computerlab',40,1,4),
    r('ULI',      'ULI',            '1','computerlab',60,2,4),
    r('ULII',     'ULII',           '1','computerlab',60,3,4),
    r('HOD_Office','HOD / Admin Office','1','office',5,4,4),
    r('LAB69',    'LAB69',          '1','lab',    30, 5,4),

    // ══ FLOOR 2 ═════════════════════════════════════════════════
    r('CR201','CR201','2','class',60, 0,5), r('CR202','CR202','2','class',60, 1,5),
    r('CR203','CR203','2','class',60, 2,5), r('CR204','CR204','2','class',60, 3,5),
    r('CR205','CR205','2','class',60, 4,5), r('CR206','CR206','2','class',60, 5,5),
    r('CR207','CR207','2','class',60, 6,5),
    r('LT201','LT201','2','lecture_theatre',120,7,5),
    r('LT202','LT202','2','lecture_theatre',120,8,5),
    r('FWR_2','Faculty Washroom',   '2','ladieswashroom',0,0,5),
    r('GWR_2','Gents Washroom',     '2','gentswashroom', 0,1,5),
    r('SR21', 'Server Room 21',     '2','office',  5, 2,6),
    r('SR_21','Staff Room 21',      '2','staffroom',20, 3,6),
    r('LWR_2','Ladies Washroom',    '2','ladieswashroom',0,4,6),
    r('Library_Main','Library (Main)','2','library',200,5,6),
    r('ERP_Cell','ERP Cell',        '2','office', 10, 6,6),
    r('TCL1','TCL Lab 1',           '2','computerlab',40,7,6),
    r('TCL2','TCL Lab 2',           '2','computerlab',40,8,6),
    r('President_Office','Dr. Kamal Ghanshala (President)','2','office',5,0,6),
    r('VC_Office','Dr. Sanjay Jasola (Vice Chancellor)','2','office',5,1,6),

    // ══ FLOOR 3 ═════════════════════════════════════════════════
    r('CR301','CR301','3','class',60,0,7), r('CR302','CR302','3','class',60,1,7),
    r('CR303','CR303','3','class',60,2,7), r('CR304','CR304','3','class',60,3,7),
    r('CR305','CR305','3','class',60,4,7),
    r('LT301','LT301','3','lecture_theatre',120,5,7),
    r('LT302','LT302','3','lecture_theatre',120,6,7),
    r('PharChem_Lab','Pharmaceutical Chemistry Lab','3','lab',40,7,7),
    r('PharAna_Lab', 'Pharmaceutical Analysis Lab', '3','lab',40,8,7),
    r('Pharmacog_I',  'Pharmacognosy I',             '3','lab',30,0,8),
    r('Pharma_I',     'Pharmaceutics I Lab',         '3','lab',30,1,8),
    r('TO_3',         'Teacher Office',              '3','staffroom',5,2,8),
    r('GWR_3',        'Gents Washroom (Lab 3)',      '3','gentswashroom',0,3,8),
    r('SR31','Staff Room 31','3','staffroom',20,4,8),
    r('SR32','Staff Room 32','3','staffroom',20,5,8),
    r('LWR_3','Ladies Washroom (Lab 7)','3','ladieswashroom',0,6,8),
    r('Dept_FineArts','Department of Fine Arts','3','department',20,7,8),
    r('Dept_Visual',  'Department of Visual Arts','3','department',20,8,8),
    r('New_Hall',     'New Hall',                 '3','hall',80,0,9),
    r('Manchanda_Office','Dr. Mahesh Manchanda Office','3','office',5,1,9),

    // ══ FLOOR 4 ═════════════════════════════════════════════════
    r('CR401','CR401','4','class',60,0,10), r('CR402','CR402','4','class',60,1,10),
    r('CR403','CR403','4','class',60,2,10), r('CR404','CR404','4','class',60,3,10),
    r('CR405','CR405','4','class',60,4,10), r('CR406','CR406','4','class',60,5,10),
    r('LT401','LT401','4','lecture_theatre',120,6,10),
    r('LT402','LT402','4','lecture_theatre',120,7,10),
    r('ElecLab1','Electronic Engg Lab I',  '4','lab',40,8,10),
    r('ElecLab2','Electronic Engg Lab II', '4','lab',40,0,11),
    r('LogicLab','Logic Design Lab',       '4','lab',40,1,11),
    r('MPLab',   'Microprocessor Lab',     '4','lab',40,2,11),
    r('Dept_Math','Department of Mathematics','4','department',20,3,11),
    r('GWR_4',   'Gents Washroom (Lab 4)', '4','gentswashroom',0,4,11),
    r('SR41','Staff Room 41','4','staffroom',20,5,11),
    r('SR42','Staff Room 42','4','staffroom',20,6,11),
    r('Dean_Academics','Dean Academics Office','4','office',5,7,11),
    r('IoT_Lab','IoT Lab',               '4','lab',30,8,11),
    r('LWR_4','Ladies Washroom',         '4','ladieswashroom',0,0,12),
    r('SR43','Staff Room 43 (CSE RR)',   '4','staffroom',10,1,12),
    r('Conf_Hall','Conference Hall',     '4','hall',100,2,12),
    r('TCL3','TCL Lab 3',                '4','computerlab',40,3,12),
    r('TCL4','TCL Lab 4',                '4','computerlab',40,4,12),

    // ══ FLOOR 5 ═════════════════════════════════════════════════
    r('CR501','CR501','5','class',60,0,13), r('CR502','CR502','5','class',60,1,13),
    r('CR503','CR503','5','class',60,2,13), r('CR504','CR504','5','class',60,3,13),
    r('LT501','LT501','5','lecture_theatre',120,4,13),
    r('LT502','LT502','5','lecture_theatre',120,5,13),
    r('Physics_Lab',  'Physics Lab',                    '5','lab',40,6,13),
    r('IAPT_Lab',     'IAPT Asian Physics Olympiad Lab', '5','lab',40,7,13),
    r('Chem_Lab',     'Chemistry Lab',                  '5','lab',40,8,13),
    r('GWR_5',        'Gents Washroom (Lab 5)',          '5','gentswashroom',0,0,14),
    r('SR51','Staff Room 51','5','staffroom',20,1,14),
    r('SR52','Staff Room 52','5','staffroom',20,2,14),
    r('TO_5','Teacher Office','5','staffroom',5,3,14),
    r('LWR_5','Ladies Washroom','5','ladieswashroom',0,4,14),
    r('Fashion_Studio','Fashion Studio',    '5','department',30,5,14),
    r('Fashion_1','Fashion Class I',        '5','class',40,6,14),
    r('Fashion_2','Fashion Class II',       '5','class',40,7,14),

    // ══ FLOOR 6 ═════════════════════════════════════════════════
    r('CR601','CR601','6','class',60,0,15), r('CR602','CR602','6','class',60,1,15),
    r('CR603','CR603','6','class',60,2,15), r('CR604','CR604','6','class',60,3,15),
    r('CR605','CR605','6','class',60,4,15),
    r('LT601','LT601','6','lecture_theatre',120,5,15),
    r('LT602','LT602','6','lecture_theatre',120,6,15),
    r('Fashion_Design_Studio','Fashion Design Studio & Theory','6','department',40,7,15),
    r('Library_II','Library II (Top Floor)','6','library',150,8,15),
    r('SR61','Staff Room 61','6','staffroom',20,0,16),
    r('SR62','Staff Room 62','6','staffroom',20,1,16),
    r('SR63','Staff Room 63','6','staffroom',20,2,16),
    r('TO_6','Teacher Office','6','staffroom',5,3,16),
    r('GWR_6','Gents Washroom (Lab 6)','6','gentswashroom',0,4,16),
    r('LWR_6','Ladies Washroom',       '6','ladieswashroom',0,5,16),
    r('Manual_Drawing','Manual Drawing Lab','6','lab',40,6,16),
    r('NSS_Office','NSS Unit Office',   '6','office',10,7,16),
    r('Moot_Court','Moot Court',        '6','hall',80,8,16),
    r('Research_Scholar','Research Scholar Room','6','office',10,0,17),
    r('KPN_Auditorium','Dr. K.P. Nautiyal Auditorium','6','auditorium',500,1,17),
  ],
}
