import mongoose from 'mongoose';

/* This schema defines a single class session in the master timetable.
It connects a specific group of students (by course, sem, section) 
to a room at a specific time.
*/

const scheduleEntrySchema = new mongoose.Schema({
    // e.g., "B.Tech (CSE)"
    course: { 
        type: String, 
        required: true,
        index: true 
    }, 
    // e.g., 3
    semester: { 
        type: Number, 
        required: true,
        index: true 
    },
    // e.g., "A"
    section: { 
        type: String, 
        required: true,
        index: true 
    },
    // e.g., "mon", "tue", "wed", "thu", "fri", "sat"
    day: { 
        type: String, 
        required: true,
        enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        index: true
    },
    // e.g., "08-09", "09-10", "10-11"
    time_slot: { 
        type: String, 
        required: true,
        index: true
    },
    // The "node" ID of the classroom, e.g., 3033
    roomid: { 
        type: Number, 
        required: true 
    },
    // The human-readable room name, e.g., "CR-301"
    roomName: { 
        type: String, 
        required: false 
    },
    // e.g., "CS-201"
    subjectCode: { 
        type: String, 
        required: false 
    },
    // e.g., "Data Structures"
    subjectName: { 
        type: String, 
        required: false 
    }
}, { timestamps: true });

// Compound index to make schedule lookups extremely fast
scheduleEntrySchema.index({ course: 1, semester: 1, section: 1, day: 1, time_slot: 1 });

const Schedule = mongoose.model("Schedule", scheduleEntrySchema);
export default Schedule;