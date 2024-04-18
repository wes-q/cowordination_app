const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const config = require("./src/utils/config");

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: config.FRONTEND_URL,
    },
});

// Socket.io connection event
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", (roomCode, currentUser) => {
        socket.join(roomCode);
        console.log(`User ${currentUser} joined ${roomCode}`);
    });

    socket.on("leaveRoom", (roomCode, currentUser) => {
        socket.leave(roomCode);
        console.log(`User ${currentUser} left ${roomCode}`);
    });

    socket.on("broadcast", (roomCode, currentUser) => {
        console.log(`broadcast received by server ${roomCode} ${currentUser}`);
        io.to(roomCode).emit("broadcast", `${currentUser} says "Hello World!" to everybody`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Start the server
server.listen(config.PORT, () => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
});
