const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const config = require("./src/utils/config");
const cors = require("cors");
const fs = require("fs");

let rooms = {}; // stores players array and in a room and its status {"players":["user1","user2","user3"],"isGameStarted":false}
let gameState = {}; // stores scores for each finished round, several games can be created in a single room
/* gameState sample
{
    "totalWords": 10,
    "clues": 2,
    "wordsToGuess": 1,
    "finishedRoundScores": [
        {
            "round": 1,
            "scores": [
                { "player": "playerA", "score": 3 },
                { "player": "playerB", "score": 2 }
            ]
        },
        {
            "round": 2,
            "scores": [
                { "player": "playerA", "score": 0 },
                { "player": "playerB", "score": 1 }
            ]
        }
    ]
}

*/
let roundState = {}; // several rounds can be played in a single game
/* roundState sample
{
    "totalWords": 10,
    "clues": 2,
    "wordsToGuess": 1,
    "randomWords": ["BUNNY", "LASER", "APPLE", "MUFFIN", "GLASS"],
    "isGameStarted": true,
    "submissions": [
        { "player": "playerA", "words": ["BUNNY"] },
        { "player": "playerB", "words": ["LASER"] }
    ]
}
*/

let fileContent = fs.readFileSync("./words_alpha.txt", "utf-8");
const wordsArray = fileContent.split("\r\n").filter(Boolean); // filter(Boolean) removes empty lines

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
        const gameID = initializeGame(totalWords, clues, wordsToGuess);
        console.log(`Game started with ID ${gameID}`);
        const roundID = initializeRound(gameID, totalWords, clues, wordsToGuess);
        console.log(`Round started with ID ${roundID}`);
        io.to(roomCode).emit("startGameSent");
        io.to(roomCode).emit("updateUI", gameState[gameID], roundState[roundID]);
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
                randomWords: [], // TODO remove
            };
        }
    };

    const initializeGame = (totalWords, clues, wordsToGuess) => {
        const gameID = generateGameID();
        gameState[gameID] = {
            totalWords: totalWords,
            clues: clues,
            wordsToGuess: wordsToGuess,
            finishedRoundScores: [],
        };
        return gameID;
    };

    const initializeRound = (gameID, totalWords, clues, wordsToGuess) => {
        const latestRound = gameState[gameID].finishedRoundScores.reduce((maxRound, roundData) => {
            return Math.max(maxRound, roundData.round);
        }, 0);

        const roundID = latestRound + 1;

        const shuffledArray = shuffleArray(wordsArray);
        const randomWordsArray = shuffledArray.slice(0, totalWords);
        console.log(randomWordsArray);

        if (!roundState[roundID]) {
            roundState[roundID] = {
                totalWords: totalWords,
                clues: clues,
                wordsToGuess: wordsToGuess,
                randomWords: randomWordsArray,
                isGameStarted: true,
                submissions: [],
            };
        }

        return roundID;
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

app.get("/rounds/:id", (req, res) => {
    const roundID = req.params.id;
    if (roundState.hasOwnProperty(roundID)) {
        res.json(roundState[roundID]);
    } else {
        res.status(404).json({ error: "Round not found" });
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

const generateGameID = () => {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
};
