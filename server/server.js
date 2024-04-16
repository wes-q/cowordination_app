const fs = require("fs");
const path = require("path");

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const GameLogic = require("./gameLogic");
let wordList = [];
const roomState = {}; // This object will store the state of each room

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    loadGameSettings();
    loadWordList();

    socket.on("createRoom", ({ playerName }) => {
        if (!playerName) {
            socket.emit("error", "Player name is required to create a room.");
            return;
        }

        const roomCode = generateRoomCode();
        const game = new GameLogic(wordList, gameSettings.WORDS_TOTAL_NUM, gameSettings.WORDS_HIGHLIGHTED_NUM, gameSettings.WORDS_TO_SELECT_NUM);

        roomState[roomCode] = {
            players: [{ id: socket.id, name: playerName }],
            game: game.initializeGameState(),
        };
        roomState[roomCode].game = game;
        roomState[roomCode].game.masterSelector = socket.id;
        // console.log(`CREATED ROOM: ${roomState}`);
        console.log(`CREATED ROOM: ${JSON.stringify(roomState[roomCode], null, 2)}`);

        socket.join(roomCode);
        socket.emit("roomCreated", roomCode);
        updatePlayerList(roomCode); // Make sure this is called here
    });

    socket.on("joinRoom", ({ roomCode, playerName }) => {
        if (roomState[roomCode]) {
            roomState[roomCode].players.push({ id: socket.id, name: playerName });
            socket.join(roomCode);
            socket.emit("roomJoined", roomCode);
            updatePlayerList(roomCode);

            // Check if the game has already started and send the current state to the new player
            if (roomState[roomCode].gameState) {
                socket.emit("gameStarted", roomState[roomCode].gameState);
            }
        } else {
            socket.emit("error", "Room does not exist");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        // Additional cleanup logic for player disconnection can be added here
    });

    socket.on("startGame", (roomCode) => {
        const room = roomState[roomCode];

        console.log("Start game:", roomCode, room);
        console.log("Socket ID:", socket.id);
        if (room && socket.id === room.players[0]["id"]) {
            room.gameState = initializeGameState();
            room.gameState.masterSelectorId = room.players[0]["id"];
            io.to(roomCode).emit("gameStarted", room.gameState);
        }
    });

    socket.on("makeSelection", ({ roomCode, selectedWords }) => {
        const player = roomState[roomCode].players.find((p) => p.id === socket.id);
        const game = roomState[roomCode].game;
        if (game && player) {
            const results = game.addSelection(socket.id, player.name, selectedWords);
            if (results) {
                io.to(roomCode).emit("revealSelections", results);
            }
            io.to(roomCode).emit(
                "updateSubmissions",
                game.submittedPlayers.map((p) => p.name)
            );
        }
    });
});

function initializeGameState() {
    const shuffled = wordList.sort(() => 0.5 - Math.random());
    return {
        wordsHighlighted: shuffled.slice(0, gameSettings.WORDS_HIGHLIGHTED_NUM),
        wordsTotal: shuffled.slice(0, gameSettings.WORDS_TOTAL_NUM),
        WORDS_TO_SELECT_NUM: gameSettings.WORDS_TO_SELECT_NUM, // Make sure this is correctly set
        masterSelectorId: null, // To be set when the game starts
    };
}

function generateRoomCode() {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
}

function loadGameSettings() {
    const configFile = path.join(__dirname, "config.json");
    try {
        const rawData = fs.readFileSync(configFile);
        gameSettings = JSON.parse(rawData);
    } catch (err) {
        console.error("Error reading the config file:", err);
    }
}

function loadWordList() {
    const dictionaryFile = path.join(__dirname, "dictionary.txt");
    try {
        const data = fs.readFileSync(dictionaryFile, "utf8");
        wordList = data.split("\n").filter((word) => word.trim() !== "");
    } catch (err) {
        console.error("Error reading the dictionary file:", err);
    }
}

function updatePlayerList(roomCode) {
    const room = roomState[roomCode];
    if (room) {
        const playerNames = room.players.map((player) => player.name);
        io.to(roomCode).emit("updatePlayerList", playerNames);
    }
}

module.exports = server;
