const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const config = require("./src/utils/config");
const cors = require("cors");
const fs = require("fs");

let rooms = {}; // stores players array and in a room and its status {"players":["user1","user2","user3"],"isGameStarted":false}
let gameState = {}; // several games can be created in a single room

let fileContent = fs.readFileSync("./words_alpha.txt", "utf-8");
const wordsArray = fileContent.split("\r\n").filter(Boolean); // filter(Boolean) removes empty lines

/*
{
    "totalWords": 10, 
    "clues": 2, 
    "wordsToGuess": 1,
    "randomWords" : [BUNNY, LASER, APPLE, MUFFIN, GLASS]

}
*/
const DEFAULTTOTALWORDS = 10;
const DEFAULTCLUES = 2;
const DEFAULTWORDSTOGUESS = 2;

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
        addPlayerToRoom(roomCode, currentUser);
        io.to(roomCode).emit("updatePlayerList", rooms[roomCode].players);
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

    socket.on("startGameReceived", (roomCode, totalWords, clues, wordsToGuess) => {
        rooms[roomCode].isGameStarted = true;

        initializeGame(roomCode, totalWords, clues, wordsToGuess);

        io.to(roomCode).emit("startGameSent");
        io.to(roomCode).emit("updateUI", gameState[1]);
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
                totalWords: DEFAULTTOTALWORDS,
                clues: DEFAULTCLUES,
                wordsToGuess: DEFAULTWORDSTOGUESS,
                randomWords: [],
            };
        }
    };

    const initializeGame = (roomCode, totalWords, clues, wordsToGuess) => {
        const gameID = 1; // TODO autoincrement
        const shuffledArray = shuffleArray(wordsArray);
        const randomWordsArray = shuffledArray.slice(0, totalWords);
        // const randomWordsObject = randomWordsArray.map((word, index) => ({
        //     [word]: false,
        // }));
        console.log(randomWordsArray);

        gameState[gameID] = {
            randomWords: randomWordsArray,
            isGameStarted: true,
            totalWords: totalWords,
            clues: clues,
            wordsToGuess: wordsToGuess,
        };
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

app.get("/games/:id", (req, res) => {
    const gameID = req.params.id;
    if (gameState.hasOwnProperty(gameID)) {
        res.json(gameState[gameID]);
    } else {
        res.status(404).json({ error: "Game not found" });
    }
});

server.listen(config.PORT, () => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
