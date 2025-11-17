//  Server.js version 5.0 (Timetable Ready)
import jsgraphs from 'js-graph-algorithms'; // Import the graph library
import cors from 'cors';                     // Import the cors middleware
import express from 'express'                // Import the express library
import { readFile } from 'fs/promises';    // Import the fs promises library
import fs from 'fs';                         // Import the fs library
import mongoose from 'mongoose';             // Import the mongoose library
import dotenv from 'dotenv';                 // Import the dotenv library

import nodeModel from './models/nodeModel.js';
import edgeModel from './models/edgeModel.js';
import map from './models/mapModel.js';
import metadata from './models/metadataModel.js';

// --- NEW IMPORTS ---
import { ApiError } from './utils/ApiError.js';
import { user_model } from './models/user.model.js';
import Schedule from './models/scheduleModel.js';
// --- END NEW IMPORTS ---

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const g_all = new jsgraphs.WeightedGraph(7000); 
const g_accessible = new jsgraphs.WeightedGraph(7000);

const loadMap1 = () => {
    return new Promise((resolve, reject) => {
        edgeModel.find({}).then((data, err) => {
            if (err) {
                console.log("XXXX Map Load 1/2 incompleted XXXX");
                return reject(err);
            }
            data.forEach(edgeObj => {
                g_all.addEdge(new jsgraphs.Edge(edgeObj.start, edgeObj.end, edgeObj.len));
                g_all.addEdge(new jsgraphs.Edge(edgeObj.end, edgeObj.start, edgeObj.len));

                if (edgeObj.isAccessible) {
                    g_accessible.addEdge(new jsgraphs.Edge(edgeObj.start, edgeObj.end, edgeObj.len));
                    g_accessible.addEdge(new jsgraphs.Edge(edgeObj.end, edgeObj.start, edgeObj.len));
                }
            });
            console.log(":::: Map Loaded 1/2 completed (All & Accessible graphs) ::::");
            resolve();
        });
    });
};

const loadMap2 = () => {
    return new Promise((resolve, reject) => {
        nodeModel.find({}).then((data, err) => {
            if (err) {
                console.log("XXXX Map Load 2/2 incompleted XXXX");
                return reject(err);
            }
            data.forEach(classObj => {
                let node = classObj.node;
                const nodeData = {
                    lat: classObj.lat,
                    long: classObj.long,
                    floor: classObj.floor, 
                    label: classObj.label,
                    name: classObj.name,
                    category: classObj.category,
                    building: classObj.building,
                    details: classObj.details
                };
                g_all.node(node).data = nodeData;
                g_accessible.node(node).data = nodeData;
            });
            console.log(":::: Map Loaded 2/2 completed (Node data) ::::");
            resolve();
        });
    });
};

const dijfunc = (src, des, accessibleOnly = false) => {
    const graph = accessibleOnly ? g_accessible : g_all;
    var dijkstra = new jsgraphs.Dijkstra(graph, src);
    let e;

    if (dijkstra.hasPathTo(des)) {
        let res = [[], [], [], [], [], [], []]; // 7 floors, 0-6
        var path = dijkstra.pathTo(des);
        let curr_floor;
        let temp_con = [];
        for (var i = 0; i < path.length; ++i) {
            e = path[i];
            let nodeData = graph.node(e.from()).data;
            if (!nodeData) continue; 

            if (i == 0) {
                curr_floor = nodeData.floor; 
            }

            let temparr = [];
            if (i != path.length - 1) {
                temparr.push(Number(nodeData.lat));
                temparr.push(Number(nodeData.long));

                if (nodeData.floor == curr_floor) {
                    temp_con.push(temparr);
                } else {
                    res[curr_floor + 1].push(temp_con); // +1 to adjust for -1 floor
                    temp_con = [];
                    temp_con.push(temparr);
                    curr_floor = nodeData.floor;
                }
            } else if (i == path.length - 1) {
                let fromData = graph.node(e.from()).data;
                let temparrFrom = [Number(fromData.lat), Number(fromData.long)];
                temp_con.push(temparrFrom);
                
                let toData = graph.node(e.to()).data;
                let temparrTo = [Number(toData.lat), Number(toData.long)];
                temp_con.push(temparrTo);
                
                res[curr_floor + 1].push(temp_con); // +1 to adjust for -1 floor
            }
        }
        return {
            "distance": dijkstra.distanceTo(des),
            "antpath": res
        };
    } else {
        console.log(`Error: Destination ${des} is unreachable from ${src} (Accessible: ${accessibleOnly}).`);
        return null;
    }
};

const segregate_aminity = (src, keyword) => {
    try {
        src = Math.floor(eval(src));
        keyword = Math.floor(eval(keyword));
        let totalToilet = (keyword == 1999) ?
            [1083, 1051, 2083, 2051, 3083, 3051, 4083, 4051, 5083, 5051, 6083, 6051] :   // Gents
            [1099, 1029, 2099, 2029, 3099, 3029, 4099, 4029, 5099, 5029, 6099, 6029];     // Ladies
        if (Math.floor(eval(src / 1000)) == 0) {
            src = eval(src) + 1000;
        }
        let des = [];
        for (let i = 0; i < totalToilet.length; i++) {
            if (Math.floor(eval(src / 1000)) == Math.floor(eval(totalToilet[i]) / 1000)) {
                des.push(totalToilet[i]);
            }
        }
        return des;
    }
    catch (err) {
        return null;
    }
};

const nearest_amenity = (src, keyword, accessibleOnly = false) => {
    let des = segregate_aminity(src, keyword);
    if (des !== null && des.length > 0) {
        const graph = accessibleOnly ? g_accessible : g_all;
        var dijkstra = new jsgraphs.Dijkstra(graph, src);

        let distance = Infinity;
        let distance_index = null;
        for (let i = 0; i < des.length; i++) {
            if (dijkstra.hasPathTo(des[i])) {
                let d = dijkstra.distanceTo(des[i]);
                if (d < distance) {
                    distance_index = des[i];
                    distance = d;
                }
            }
        }
        
        if (distance_index === null) {
            console.log(`Error: Could not find any *reachable* amenity for ${keyword} (Accessible: ${accessibleOnly}).`);
            return null;
        }
        return distance_index;
    } else {
        console.log('Error: Could not find suitable destination.');
        return null;
    }
};

// --- NEW HELPER FUNCTION ---
/**
 * Gets the current day and matching time slot string.
 * This logic matches the 12-hour format used in the frontend's 'fetch_time_detail'
 */
const getCurrentTimeSlot = () => {
    // const now = new Date(); // Use server time
    // OR Use Indian Standard Time
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const day = weekdays[now.getDay()];

    let time_slot_string;
    let h = now.getHours();
    // h = 10; // for testing

    if (h >= 8 && h < 9) time_slot_string = "08-09";
    else if (h >= 9 && h < 10) time_slot_string = "09-10";
    else if (h >= 10 && h < 11) time_slot_string = "10-11";
    else if (h >= 11 && h < 12) time_slot_string = "11-12";
    else if (h >= 12 && h < 13) time_slot_string = "12-01"; // 12 PM - 1 PM
    else if (h >= 13 && h < 14) time_slot_string = "01-02"; // 1 PM - 2 PM
    else if (h >= 14 && h < 15) time_slot_string = "02-03"; // 2 PM - 3 PM
    else if (h >= 15 && h < 16) time_slot_string = "03-04"; // 3 PM - 4 PM
    else if (h >= 16 && h < 17) time_slot_string = "04-05"; // 4 PM - 5 PM
    else if (h >= 17 && h < 18) time_slot_string = "05-06"; // 5 PM - 6 PM
    else time_slot_string = "closed"; // Outside class hours

    return { day, time_slot: time_slot_string };
};
// --- END NEW HELPER FUNCTION ---


app.get('/getCoordinates', (req, res) => {
    let src = req.query.src;
    let des = req.query.des;
    let accessible = req.query.accessible === 'true';

    console.log(`:::: Path Request: ${src} => ${des} (Accessible: ${accessible}) ::::`);

    let AmenityArr = ["1999", "1998"];
    let coordinates;
    if (AmenityArr.includes(des)) {
        des = nearest_amenity(src, des, accessible);
        if (des == null) {
            return res.status(404).json({ 
                "status": 'error',
                "error": 'No reachable amenity found.'
            });
        }
    }
    
    // Ensure src and des are numbers for Dijkstra
    const numSrc = parseInt(src, 10);
    const numDes = parseInt(des, 10);

    if (isNaN(numSrc) || isNaN(numDes)) {
         return res.status(400).json({
            "status": 'error',
            "error": 'Invalid source or destination ID.'
        });
    }

    coordinates = dijfunc(numSrc, numDes, accessible);

    if (coordinates) {
        res.status(200).json({
            "status": 'success',
            "data": coordinates
        });
    } else {
        res.status(404).json({
            "status": 'error',
            "error": 'No path found.'
        });
    }
});

app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ status: 'error', error: 'Missing search query (q)' });
        }

        const regex = new RegExp(query, 'i'); 

        const results = await nodeModel.find(
            {
                $and: [
                    { $or: [
                        { name: regex },
                        { label: regex },
                        { description: regex },
                        { category: regex }
                    ]},
                    { category: { $ne: 'navigation' } } 
                ]
            },
            'node name label description category floor building' 
        ).limit(20); 

        res.status(200).json({
            "status": 'success',
            "data": results
        });

    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
});


app.get('/getmap', async (req, res) => {
    try {
        let serverhitcount;
        const metaDataEntry = await metadata.findOne(); 
        if (!metaDataEntry) {
             console.log("No metadata entry found. Initializing.");
             serverhitcount = 0;
        } else {
            serverhitcount = metaDataEntry.serverhitcount;
            await metadata.updateOne({ _id: metaDataEntry._id }, { $inc: { serverhitcount: 1 } });
            serverhitcount % 10 == 0 ? console.log(":::: Server Hit + 10 ::::") : "";
        }

        const mapdata = await map.find({});
        res.status(200).json({
            "status": 'success',
            "data": mapdata,
            "hitcount": serverhitcount
        });
    } catch (err) {
        console.error("GetMap Error:", err); 
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/keepmeawake', (req, res) => {
    res.status(200).json({ "status": 'Up and Running Boi' });
});

import { signup, verifyotp, signin, resendotp, resetpassword, resetpasswordverify, update_info, verifyJWT } from './users.controller.js';
import { generateAndSendPDF } from './pdfqr.controller.js';
import { ApiResponse } from './utils/ApiResponse.js';

app.post('/signup', signup);
app.post('/verifyotp', verifyotp);
app.post('/signin', signin);
app.post('/resendotp', resendotp);
app.post('/resetpassword', resetpassword);
app.post('/resetpasswordverify', resetpasswordverify);
app.post('/update_info', verifyJWT, update_info);
app.post("/generateqrpdf", generateAndSendPDF);

import { upload_face, get_face, verify_face, get_unverified_users, } from './users.face.controller.js';

app.post('/upload_face', verifyJWT, upload_face);
app.post('/get_face', get_face);
app.post('/verify_face', verifyJWT, verify_face);
app.post('/get_unverified_users', verifyJWT, get_unverified_users);
app.post('/verifyJWT', verifyJWT, (req, res) => {
    res.status(200).json(
        new ApiResponse(200, {
            message: "Token is valid",
        }, 'User updated successfully')
    );
});


// --- NEW: API endpoint for "Next Class" ---
app.get('/api/v1/schedule/next-class', verifyJWT, async (req, res) => {
    try {
        // 1. Get user ID from JWT token
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(401, "User not authenticated.");
        }

        // 2. Find the user in the database
        const user = await user_model.findById(userId).select('course semester section');
        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        // 3. Check if user has schedule details
        if (!user.course || !user.semester || !user.section) {
            return res.status(200).json(
                new ApiResponse(200, { found: false, message: "Please set course, semester, and section in your profile." }, "User profile incomplete.")
            );
        }
        
        // 4. Get the current day and time slot
        const { day, time_slot } = getCurrentTimeSlot();

        if (time_slot === "closed") {
             return res.status(200).json(
                new ApiResponse(200, { found: false, message: "Campus is currently closed." }, "No classes scheduled.")
            );
        }

        // 5. Find the matching class in the schedule
        const currentClass = await Schedule.findOne({
            course: user.course,
            semester: user.semester,
            section: user.section,
            day: day,
            time_slot: time_slot
        });

        if (!currentClass) {
            return res.status(200).json(
                new ApiResponse(200, { found: false, message: "You don't have a class right now." }, "No class scheduled.")
            );
        }

        // 6. Return the found class details
        return res.status(200).json(
            new ApiResponse(200, { found: true, class: currentClass }, "Current class found.")
        );

    } catch (error) {
        console.error("Next Class API Error:", error);
        // Handle known ApiErrors
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
        }
        // Handle other errors
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
});
// --- END NEW API ENDPOINT ---


// --- SERVER LISTEN (Unchanged) ---
app.listen(port, async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(':::: Mongo_DB Connected ::::');
        await loadMap1();
        await loadMap2();
        console.log(`:::: Server listening http://localhost:${port} ::::`);
        console.log(`:::: Go on , I'm listening ::::`);
    } catch (err) {
        console.error("FATAL SERVER STARTUP ERROR:", err);
        process.exit(1); // Exit if maps or DB fail to load
    }
});