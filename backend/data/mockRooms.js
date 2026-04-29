// Mock room data based on navit's room structure
// roomid format: floor * 1000 + room_number
// -1=B floor, 0=G floor, 1=1st, 2=2nd, 3=3rd, 4=4th, 5=5th

const emptySchedule = (days = ['mon','tue','wed','thu','fri','sat']) => {
  const slots = ['08-09','09-10','10-11','11-12','12-01','01-02','02-03','03-04','04-05','05-06'];
  const schedule = {};
  days.forEach(day => {
    schedule[day] = {};
    slots.forEach(slot => {
      schedule[day][slot] = { section: '', course: '', subjectcode: '', semester: '' };
    });
  });
  return schedule;
};

const rooms = [
  // === GROUND FLOOR (roomid 1000-1999) ===
  { roomid: 1001, name: 'CR101', floor: '0', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 1002, name: 'CR102', floor: '0', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 1003, name: 'CR103', floor: '0', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 1004, name: 'CR104', floor: '0', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 1005, name: 'CR105', floor: '0', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 1006, name: 'CR106', floor: '0', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 1011, name: 'Teacher\'s Room', floor: '0', building: 'Main', type: 'staffroom', capacity: 10, schedule: emptySchedule() },
  { roomid: 1012, name: 'Gents Washroom', floor: '0', building: 'Main', type: 'gentswashroom', capacity: 0, schedule: emptySchedule() },
  { roomid: 1013, name: 'Ladies Washroom', floor: '0', building: 'Main', type: 'ladieswashroom', capacity: 0, schedule: emptySchedule() },
  { roomid: 1014, name: 'Staff Room G1', floor: '0', building: 'Main', type: 'staffroom', capacity: 10, schedule: emptySchedule() },
  { roomid: 1015, name: 'Staff Room G2', floor: '0', building: 'Main', type: 'staffroom', capacity: 10, schedule: emptySchedule() },
  { roomid: 1016, name: 'Bosch Lab', floor: '0', building: 'Main', type: 'lab', capacity: 30, schedule: emptySchedule() },
  { roomid: 1017, name: 'Teacher\'s Cabin', floor: '0', building: 'Main', type: 'office', capacity: 5, schedule: emptySchedule() },
  { roomid: 1018, name: 'LAB1', floor: '0', building: 'Main', type: 'lab', capacity: 30, schedule: emptySchedule() },
  { roomid: 1019, name: 'HOD Office', floor: '0', building: 'Main', type: 'office', capacity: 5, schedule: emptySchedule() },
  { roomid: 1020, name: 'LABS', floor: '0', building: 'Main', type: 'lab', capacity: 30, schedule: emptySchedule() },
  { roomid: 1021, name: 'Open Auditorium', floor: '0', building: 'Main', type: 'other', capacity: 200, schedule: emptySchedule() },
  { roomid: 1022, name: 'Meeting Hall', floor: '0', building: 'Main', type: 'other', capacity: 40, schedule: emptySchedule() },
  { roomid: 1023, name: 'Seminar Hall', floor: '0', building: 'Main', type: 'other', capacity: 100, schedule: emptySchedule() },
  { roomid: 1024, name: 'Main Office', floor: '0', building: 'Main', type: 'office', capacity: 10, schedule: emptySchedule() },
  { roomid: 1025, name: 'Library Sitting Area', floor: '0', building: 'Main', type: 'library', capacity: 50, schedule: emptySchedule() },
  { roomid: 1026, name: 'Mac Lab', floor: '0', building: 'Main', type: 'computerlab', capacity: 30, schedule: emptySchedule() },
  { roomid: 1027, name: 'Medical Room', floor: '0', building: 'Main', type: 'other', capacity: 5, schedule: emptySchedule() },
  { roomid: 1028, name: 'ULI', floor: '0', building: 'Main', type: 'lab', capacity: 60, schedule: emptySchedule() },
  { roomid: 1029, name: 'ULII', floor: '0', building: 'Main', type: 'lab', capacity: 60, schedule: emptySchedule() },
  // Washroom IDs used in navit for destination
  { roomid: 1998, name: 'Ladies Washroom G', floor: '0', building: 'Main', type: 'ladieswashroom', capacity: 0, schedule: emptySchedule() },
  { roomid: 1999, name: 'Gents Washroom G', floor: '0', building: 'Main', type: 'gentswashroom', capacity: 0, schedule: emptySchedule() },

  // === FLOOR 1 (roomid 2000-2999) ===
  { roomid: 2001, name: 'CR201', floor: '1', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 2002, name: 'CR202', floor: '1', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 2003, name: 'CR203', floor: '1', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 2004, name: 'CR204', floor: '1', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 2005, name: 'CR205', floor: '1', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 2006, name: 'CR206', floor: '1', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 2007, name: 'CR207', floor: '1', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 2011, name: 'LT201', floor: '1', building: 'Main', type: 'class', capacity: 120, schedule: emptySchedule() },
  { roomid: 2012, name: 'LT202', floor: '1', building: 'Main', type: 'class', capacity: 120, schedule: emptySchedule() },
  { roomid: 2013, name: 'TCL Lab 1', floor: '1', building: 'Main', type: 'computerlab', capacity: 30, schedule: emptySchedule() },
  { roomid: 2014, name: 'TCL Lab 2', floor: '1', building: 'Main', type: 'computerlab', capacity: 30, schedule: emptySchedule() },
  { roomid: 2015, name: 'TCL Lab 3', floor: '1', building: 'Main', type: 'computerlab', capacity: 30, schedule: emptySchedule() },
  { roomid: 2016, name: 'TCL Lab 4', floor: '1', building: 'Main', type: 'computerlab', capacity: 30, schedule: emptySchedule() },
  { roomid: 2017, name: 'Staff Room 1', floor: '1', building: 'Main', type: 'staffroom', capacity: 10, schedule: emptySchedule() },
  { roomid: 2018, name: 'Server Room', floor: '1', building: 'Main', type: 'other', capacity: 5, schedule: emptySchedule() },
  { roomid: 2019, name: 'Ladies Washroom 1', floor: '1', building: 'Main', type: 'ladieswashroom', capacity: 0, schedule: emptySchedule() },
  { roomid: 2020, name: 'Gents Washroom 1', floor: '1', building: 'Main', type: 'gentswashroom', capacity: 0, schedule: emptySchedule() },
  { roomid: 2021, name: 'School of Pharmacy Lab', floor: '1', building: 'Main', type: 'lab', capacity: 30, schedule: emptySchedule() },
  { roomid: 2022, name: 'ERP Cell', floor: '1', building: 'Main', type: 'office', capacity: 5, schedule: emptySchedule() },
  { roomid: 2023, name: 'Library Main', floor: '1', building: 'Main', type: 'library', capacity: 100, schedule: emptySchedule() },
  { roomid: 2024, name: 'President Office', floor: '1', building: 'Main', type: 'office', capacity: 5, schedule: emptySchedule() },
  { roomid: 2025, name: 'Vice Chancellor Office', floor: '1', building: 'Main', type: 'office', capacity: 5, schedule: emptySchedule() },
  { roomid: 2026, name: 'Teacher Office 1', floor: '1', building: 'Main', type: 'staffroom', capacity: 10, schedule: emptySchedule() },

  // === FLOOR 2 (roomid 3000-3999) ===
  { roomid: 3001, name: 'CR301', floor: '2', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 3002, name: 'LT302', floor: '2', building: 'Main', type: 'class', capacity: 120, schedule: emptySchedule() },
  { roomid: 3003, name: 'CR303', floor: '2', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 3004, name: 'CR304', floor: '2', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 3011, name: 'Ladies Washroom 2', floor: '2', building: 'Main', type: 'ladieswashroom', capacity: 0, schedule: emptySchedule() },
  { roomid: 3012, name: 'Gents Washroom 2', floor: '2', building: 'Main', type: 'gentswashroom', capacity: 0, schedule: emptySchedule() },

  // === FLOOR 3 (roomid 4000-4999) — Building B ===
  { roomid: 4001, name: 'Cafeteria / Mess', floor: '3', building: 'B', type: 'cafeteria', capacity: 200, schedule: emptySchedule() },
  { roomid: 4002, name: 'Tuck Shop', floor: '3', building: 'B', type: 'other', capacity: 20, schedule: emptySchedule() },
  { roomid: 4003, name: 'Teacher Dining Area', floor: '3', building: 'B', type: 'other', capacity: 30, schedule: emptySchedule() },
  { roomid: 4004, name: 'Fee Cell', floor: '3', building: 'B', type: 'office', capacity: 5, schedule: emptySchedule() },
  { roomid: 4005, name: 'Registrar Office', floor: '3', building: 'B', type: 'office', capacity: 5, schedule: emptySchedule() },
  { roomid: 4006, name: 'Degree & Certificates', floor: '3', building: 'B', type: 'office', capacity: 5, schedule: emptySchedule() },
  { roomid: 4007, name: 'CCTV Room', floor: '3', building: 'B', type: 'other', capacity: 3, schedule: emptySchedule() },
  { roomid: 4008, name: 'Exam Controller', floor: '3', building: 'B', type: 'office', capacity: 5, schedule: emptySchedule() },
  { roomid: 4009, name: 'Workshop', floor: '3', building: 'B', type: 'lab', capacity: 40, schedule: emptySchedule() },
  { roomid: 4010, name: 'Civil Engineering Lab', floor: '3', building: 'B', type: 'lab', capacity: 30, schedule: emptySchedule() },

  // === FLOOR 4 (roomid 5000-5999) ===
  { roomid: 5001, name: 'CR401', floor: '4', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 5002, name: 'CR402', floor: '4', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 5003, name: 'CR403', floor: '4', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 5004, name: 'CR404', floor: '4', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 5005, name: 'CR405', floor: '4', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 5006, name: 'CR406', floor: '4', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 5011, name: 'Electronic Engg Lab II', floor: '4', building: 'Main', type: 'lab', capacity: 30, schedule: emptySchedule() },
  { roomid: 5012, name: 'Logic Design Microprocessor Lab', floor: '4', building: 'Main', type: 'lab', capacity: 30, schedule: emptySchedule() },
  { roomid: 5013, name: 'Dean Academics Office', floor: '4', building: 'Main', type: 'office', capacity: 5, schedule: emptySchedule() },
  { roomid: 5014, name: 'Ladies Washroom 4', floor: '4', building: 'Main', type: 'ladieswashroom', capacity: 0, schedule: emptySchedule() },
  { roomid: 5015, name: 'Gents Washroom 4', floor: '4', building: 'Main', type: 'gentswashroom', capacity: 0, schedule: emptySchedule() },

  // === FLOOR 5 (roomid 6000-6999) ===
  { roomid: 6001, name: 'CR501', floor: '5', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 6002, name: 'CR502', floor: '5', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 6003, name: 'CR503', floor: '5', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 6004, name: 'CR504', floor: '5', building: 'Main', type: 'class', capacity: 60, schedule: emptySchedule() },
  { roomid: 6011, name: 'Ladies Washroom 5', floor: '5', building: 'Main', type: 'ladieswashroom', capacity: 0, schedule: emptySchedule() },
  { roomid: 6012, name: 'Gents Washroom 5', floor: '5', building: 'Main', type: 'gentswashroom', capacity: 0, schedule: emptySchedule() },

  // === BASEMENT (roomid 0-999) ===
  { roomid: 100, name: 'Basement Parking', floor: '-1', building: 'Main', type: 'other', capacity: 0, schedule: emptySchedule() },
  { roomid: 101, name: 'Basement Store', floor: '-1', building: 'Main', type: 'other', capacity: 0, schedule: emptySchedule() },
];

module.exports = rooms;
