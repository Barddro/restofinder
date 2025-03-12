// app/server.js
//import { processData, processRestoNums, getBestFoodTypeWant, devolve, devolveUseAPI, checkIfKeyExist, findKey, average } from "./lib/utils.js";
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const utils = require("./lib/utils.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow Next.js frontend
    methods: ["GET", "POST"],
  },
});


const rooms = {}; // Stores active rooms
const roomsMap = {};

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    roomsMap[socket.id] = null;

    
    // Host creates a room with a unique code
    socket.on("createRoom", () => {
        const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        rooms[roomCode] = { 
            host: socket.id, 
            users: [], 
            clientState: {},
            roomState: 0, //0 = not started, 1 = in progress, 2 = finished
            questionNum: 0,
            restrictions: Array(4).fill(false),
            clientInput: [
                /*
                [], //foodTypeWant
                [], //foodTypeDontWant
                [], // Distance
                [], // PriceRange
                */
                {}, //foodTypeWant
                {}, //foodTypeDontWant
                {}, // Distance
                {}, // PriceRange
                
            ],
        };
        rooms[roomCode].clientState[socket.id] = 0
        roomsMap[socket.id] = roomCode;
        
        socket.join(roomCode);
        console.log(`Room created: ${roomCode}`);
        socket.emit("roomCreated", roomCode);

    });

    // User joins a room using a code
    socket.on("joinRoom", (roomCode) => {
        if (rooms[roomCode] && !rooms[roomCode].roomState) {
            socket.join(roomCode);
            rooms[roomCode].users.push(socket.id);
            rooms[roomCode].clientState[socket.id] = 0;
            console.log(`User ${socket.id} joined room ${roomCode}`);
            socket.emit("joinedRoom", roomCode);
            io.to(roomCode).emit("userJoined", socket.id);
            roomsMap[socket.id] = roomCode;
        } else if (rooms[roomCode].roomState) {
            socket.emit("error", "Room is already in progress");
        } else {
            socket.emit("error", "Room not found");
        }
    });

    socket.on("readyBegin", (roomCode) => {
        rooms[roomCode].roomState = 1;
        console.log("Host ready to begin room:", roomCode);
        io.to(roomCode).emit("begin");
    });

    socket.on("submitAnswer", (clientID, roomCode, answer) => {
        rooms[roomCode].clientState[clientID] = 1;

        console.log('answer submitted by ', clientID);
        console.log('current client state obj: ', rooms[roomCode].clientState);

        questionNum = rooms[roomCode].questionNum;
        rooms[roomCode].clientInput[questionNum][clientID] = answer;


        if (Object.values(rooms[roomCode].clientState).every(state => state === 1)) {
            console.log('all clients have submitted their answers: ', rooms[roomCode].clientInput);
            for(var key in rooms[roomCode].clientState) {
                rooms[roomCode].clientState[key] = 0;
            }

            rooms[roomCode].questionNum ++;
            console.log('ready to proceed to question ', rooms[roomCode].questionNum);
            io.to(roomCode).emit("readyProceed", rooms[roomCode].questionNum);

            if (rooms[roomCode].questionNum === 4) {
                console.log('ready to proceed to results');
                rooms[roomCode].roomState = 2;
                console.log(rooms[roomCode].clientInput);
                rooms[roomCode].restaurants = utils.processData(rooms[roomCode].clientInput, rooms[roomCode].users.length);
            }
            
        }
    });

    socket.on("checkRoom", (roomCode, callback) => {
        // Check if the room exists
        const roomExists = io.sockets.adapter.rooms.has(roomCode);
        
        let roomState = null;

        if (roomExists && rooms[roomCode]) {
            roomState = rooms[roomCode].roomState;
        }

        callback(roomExists, roomState);
    });

    // Handle disconnections
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);

        userSocket = socket.id
        userRoom = roomsMap[userSocket];

        // cleanup user input if game in progress
        if (userRoom && rooms[userRoom].roomState >= 1) {

            console.log('starting user disconnect cleanup')

            delete rooms[userRoom].clientState.userSocket;

            if (rooms[userRoom].roomState === 1) {
                for (let i = 0; i < rooms[userRoom].clientInput.length; i++) {
                    delete rooms[userRoom].clientInput[i].userSocket;
                }
            }
        }

        delete roomsMap.userSocket;

        for (const [roomCode, room] of Object.entries(rooms)) {
            if (room.host === socket.id) { // close room on host disconnect
                io.to(roomCode).emit("roomClosed");
                delete rooms[roomCode];
                console.log(`Room ${roomCode} closed`);
            } else {
                room.users = room.users.filter(id => id !== socket.id);
                io.to(roomCode).emit("userLeft", socket.id);
            }
        }
    });
});

server.listen(4000, () => console.log("Socket.IO server running on port 4000"));