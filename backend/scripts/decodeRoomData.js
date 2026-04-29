// This script decodes the navit room.json base64 and saves it as mockRooms.js
// Run: node scripts/decodeRoomData.js (one-time setup)
const fs = require('fs');
const path = require('path');

// Base64 content from navit repo: frontend-react/src/pages/assets/room.json
// SHA: 736aeb83c16ee8429a64ab88e7f9d36f81836671
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

async function decode() {
  const res = await fetch('https://api.github.com/repos/ayush-saklani/navit/git/blobs/736aeb83c16ee8429a64ab88e7f9d36f81836671');
  const json = await res.json();
  const decoded = Buffer.from(json.content, 'base64').toString('utf-8');
  const outPath = path.join(__dirname, '../data/roomData.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, decoded);
  console.log('✅ Room data saved to', outPath);
}
decode().catch(console.error);
