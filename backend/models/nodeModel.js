import mongoose from "mongoose";

const nodeSchema = mongoose.Schema({
    "node": { 
        // node number in the graph (0 to 6999)
        type: Number,
        required: true,
        unique: true, // Ensures no duplicate nodes
        index: true   // Speeds up searching for a specific node
    },
    "lat": { 
        // latitude 
        type: String,
        required: true
    },
    "long": { 
        // longitude
        type: String,         
        required: true
    },
    "floor": { 
        // "0", "1", "2", "3", "4", "5", "6"
        type: Number, // CHANGED: From String to Number
        required: true,
        index: true   // Speeds up filtering by floor
    },
    "type": { 
        // Original type: "classroom", "lecturetheater", "elevator", "staircase", "node"
        type: String,         
        required: true
    },
    "label": { 
        // Original label: (name of the classroom, lecture theater, etc.)
        type: String,
        required: false
    },

    // --- NEW ADVANCED FIELDS ---

    "building": {
        // e.g., "Main Block", "Admin Building", "Library"
        type: String,
        required: false, // May not apply to outdoor nodes
        index: true      // Good for searching within a building
    },
    "category": {
        // A structured category for filtering (e.g., find all "amenity")
        type: String,
        enum: [
            'navigation',     // A simple path node, not a destination
            'classroom',
            'lectureHall',
            'lab',
            'office',         // Faculty or Admin office
            'service',        // e.g., "Admissions Desk", "Library Counter"
            'amenity',        // e.g., "Restroom", "Cafe", "Water Fountain"
            'vertical',       // "Elevator", "Stairs"
            'poi',            // "Main Entrance", "Statue"
            'other'
        ],
        required: true,
        default: 'navigation'
    },
    "name": {
        // The proper, searchable name: e.g., "Professor Rajat's Office" or "CS-101"
        type: String,
        required: false, // A 'navigation' node might not have a name
        index: true      // CRITICAL for user search
    },
    "description": {
        // Extra searchable details: e.g., "B.Tech CSE 1st Year (Section A)"
        type: String,
        required: false
    },
    "details": {
        // Flexible key-value pairs for extra data
        type: Map,
        of: String,
        required: false
        // Example: { "professor": "Dr. Rajat Shahi", "hours": "Mon-Wed 10:00-12:00" }
    }
});

const node = mongoose.model("node", nodeSchema);
export default node;