const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const config = require("./src/utils/config");
const cors = require("cors");

let rooms = {}; // stores players array in a room {"roomCode":["user1","user2","user3"]}

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: config.FRONTEND_URL,
    },
});

app.use(
    cors({
        origin: config.FRONTEND_URL,
        methods: "GET,POST,PUT,DELETE",
        credentials: true,
        optionSuccessStatus: 200,
        Headers: true,
        exposedHeaders: "Set-Cookie",
        allowedHeaders: ["Access-Control-Allow-Origin", "Content-Type", "Authorization"],
    })
);

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", (roomCode, currentUser) => {
        socket.join(roomCode);
        initializeRoom(roomCode);
        addPlayerToRoom(roomCode, currentUser);
        io.to(roomCode).emit("updatePlayerList", rooms[roomCode]);
        console.log(`User ${currentUser} joined ${roomCode}`);
    });

    socket.on("leaveRoom", (roomCode, currentUser) => {
        socket.leave(roomCode);
        removePlayerFromRoom(roomCode, currentUser);
        io.to(roomCode).emit("updatePlayerList", rooms[roomCode]);
        console.log(`User ${currentUser} left ${roomCode}`);
    });

    socket.on("broadcastReceived", (roomCode, currentUser) => {
        console.log(`broadcast received by server ${roomCode} ${currentUser}`);
        io.to(roomCode).emit("broadcastSent", `${currentUser} says "Hello World!" to everybody`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

    const initializeRoom = (roomCode) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
        }
    };

    const addPlayerToRoom = (roomCode, currentUser) => {
        rooms[roomCode].push(currentUser);
    };

    const removePlayerFromRoom = (roomCode, currentUser) => {
        rooms[roomCode] = rooms[roomCode].filter((user) => user !== currentUser);
    };
});

app.get("/connected-sockets", (req, res) => {
    // console.log(rooms);
    // rooms["AAAA"].push("test");
    res.json(rooms);
});

app.get("/rooms/:id", (req, res) => {
    const roomCode = req.params.id;
    // console.log(rooms);
    // rooms["AAAA"].push("test");
    res.json(rooms[roomCode]);
});

server.listen(config.PORT, () => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
});
