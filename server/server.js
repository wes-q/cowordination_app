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

    // Emit a message to the client
    socket.emit("message", "Welcome to the Socket.io server!");

    socket.on("joinRoom", (roomCode, currentUser) => {
        socket.join(roomCode);
        console.log(`Client ${currentUser} joined ${roomCode}`);
    });

    // socket.on("broadcast", () => {
    //     console.log("broadcast received by server");
    //     io.to("WESQ").emit("sayHello", "Hello World!");
    // });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Start the server
server.listen(config.PORT, () => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
});
