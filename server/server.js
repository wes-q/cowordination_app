const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", //TODO: remove hardcode
    },
});

// Socket.io connection event
io.on("connection", (socket) => {
    console.log("A user connected");

    // Emit a message to the client
    socket.emit("message", "Welcome to the Socket.io server!");

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Start the server
const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
