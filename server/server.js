const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const config = require("./src/utils/config");
const cors = require("cors");

let rooms = {}; // stores players array in a room {"players":["user1","user2","user3"],"isGameStarted":boolean}

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

    socket.on("joinRoomReceived", (roomCode, currentUser) => {
        socket.join(roomCode);
        initializeRoomIfNotExisting(roomCode);

        if (isPlayerInRoomExisting(roomCode, currentUser)) {
            addPlayerToRoom(roomCode, currentUser);
            io.to(roomCode).emit("updatePlayerList", rooms[roomCode].players);
        }
        console.log(`User ${currentUser} joined ${roomCode}`);
    });

    socket.on("leaveRoom", (roomCode, currentUser) => {
        socket.leave(roomCode);
        if (isPlayerInRoomExisting(roomCode, currentUser)) {
            removePlayerFromRoom(roomCode, currentUser);
            io.to(roomCode).emit("updatePlayerList", rooms[roomCode].players);
        }
        console.log(`User ${currentUser} left ${roomCode}`);
    });

    socket.on("broadcastReceived", (roomCode, currentUser) => {
        io.to(roomCode).emit("broadcastSent", `${currentUser} says "Hello World!" to everybody`);
        console.log(`broadcast received by server ${roomCode} ${currentUser}`);
    });

    socket.on("startGameReceived", (roomCode) => {
        rooms[roomCode].isGameStarted = true;
        io.to(roomCode).emit("startGameSent");
        console.log(`Game started on room ${roomCode}`);
    });
    socket.on("endGameReceived", (roomCode) => {
        rooms[roomCode].isGameStarted = false;
        io.to(roomCode).emit("endGameSent");
        console.log(`Game ended on room ${roomCode}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

    const initializeRoomIfNotExisting = (roomCode) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                players: [],
                isGameStarted: false,
            };
        }
    };

    const isPlayerInRoomExisting = (roomCode, currentUser) => {
        if (rooms.hasOwnProperty(roomCode) && rooms[roomCode].players.includes(currentUser)) {
            return true;
        } else {
            return false;
        }
    };

    const addPlayerToRoom = (roomCode, currentUser) => {
        rooms[roomCode].players.push(currentUser);
    };

    const removePlayerFromRoom = (roomCode, currentUser) => {
        rooms[roomCode].players = rooms[roomCode].players.filter((user) => user !== currentUser);
    };
});

app.get("/connected-sockets", (req, res) => {
    res.json(rooms);
});

app.get("/rooms/:id", (req, res) => {
    const roomCode = req.params.id;
    if (rooms.hasOwnProperty(roomCode)) {
        res.json(rooms[roomCode]);
    } else {
        res.status(404).json({ error: "Room not found" });
    }
});

server.listen(config.PORT, () => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
});
