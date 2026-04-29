// UniPath color palette — matches GEHU branding
export const mapColorSet = {
  class:            { color: '#2a5555', fillColor: 'rgba(100,180,175,0.5)' },
  lecture_theatre:  { color: '#2a5555', fillColor: '#6a9bb5' },
  lab:              { color: '#2a5555', fillColor: '#7eb8c4' },
  computerlab:      { color: '#2a5555', fillColor: '#7eb8c4' },
  staffroom:        { color: '#2a5555', fillColor: '#d4a850' },
  office:           { color: '#2a5555', fillColor: '#9b8fc4' },
  department:       { color: '#2a5555', fillColor: '#a0b8d0' },
  library:          { color: '#2a5555', fillColor: '#8fbfbf' },
  auditorium:       { color: '#2a5555', fillColor: '#7a9e9e' },
  hall:             { color: '#2a5555', fillColor: '#7a9e9e' },
  cafeteria:        { color: '#2a5555', fillColor: '#a8c89a' },
  ladieswashroom:   { color: '#2a5555', fillColor: '#e8a0b0' },
  gentswashroom:    { color: '#2a5555', fillColor: '#5bbfbf' },
  parking:          { color: '#2a5555', fillColor: 'rgba(180,180,180,0.4)' },
  other:            { color: '#2a5555', fillColor: 'rgba(160,160,160,0.3)' },
}

// Campus center — GEHU Dehradun, Paltan Bazar Road (Real coordinates)
export const CAMPUS_CENTER = [30.27345, 77.99974]
export const DEFAULT_ZOOM  = 18

// All floors supported
export const FLOORS = [-1, 0, 1, 2, 3, 4, 5, 6]

export const FLOOR_LABELS = {
  '-1': 'Basement (B)',
  '0':  'Ground Floor (G)',
  '1':  '1st Floor',
  '2':  '2nd Floor',
  '3':  '3rd Floor',
  '4':  '4th Floor',
  '5':  '5th Floor',
  '6':  '6th Floor',
}

// Floor number → string key used in GeoJSON features
export const FLOOR_STR = {
  '-1': 'B', '0': 'G', '1':'1', '2':'2', '3':'3', '4':'4', '5':'5', '6':'6',
}

export const ALLOWED_DOMAINS = ['gehu.ac.in', 'geu.ac.in']
export const TIME_SLOTS = ['08-09','09-10','10-11','11-12','12-01','01-02','02-03','03-04','04-05','05-06']
export const DAYS = ['sun','mon','tue','wed','thu','fri','sat']
