import mongoose from "mongoose";

const edgeSchema = mongoose.Schema({
    "start": { 
        // node number in the graph (0 to 6999)
        type: Number,
        required: true,
        index: true // Indexing this helps find all edges from a node quickly
    },
    "end": { 
        // end node number in the graph (0 to 6999)
        type: Number,         
        required: true
    },
    "len": { 
        // length of the edge (in meters)
        type: Number,
        required: true
    },

    // --- NEW ADVANCED FIELDS ---

    "type": {
        // Defines what kind of path this is
        type: String,
        enum: [
            'walkway',    // A normal path
            'stairs',
            'elevator',
            'ramp',
            'door',       // A path that goes through a door
            'vertical'    // General term for floor transition
        ],
        required: true,
        default: 'walkway'
    },
    "isAccessible": {
        // CRITICAL: Is this path wheelchair-friendly?
        type: Boolean,
        required: true,
        default: true,  // Assume most paths are accessible until marked otherwise
        index: true     // VERY important for filtering accessible-only routes
    },
    "floor": {
        // What floor is this path segment on?
        // For stairs/elevators, this would be the 'start' floor.
        type: Number,
        required: false // May not be set for all old data, but required for new
    },
    "building": {
        // Which building is this path in?
        type: String,
        required: false // Not all paths are in a building
    }
});

// Compound index to speed up finding accessible paths on a specific floor
edgeSchema.index({ floor: 1, isAccessible: 1 });

const edge = mongoose.model("edge", edgeSchema);

export default edge;