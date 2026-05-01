const axios = require('axios');

async function testCreate() {
  try {
    const res = await axios.post('http://localhost:5000/api/events', {
      title: "Test API Event",
      description: "Testing API",
      date: "2026-05-02",
      time: "10:00 AM",
      venue: "Test Venue",
      organizer: "Test Org"
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("ERROR:", err.response ? err.response.data : err.message);
  }
}

testCreate();
