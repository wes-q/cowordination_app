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
    "rounds": [
        {
            "round": 1,
            "randomWords": ["BUNNY", "LASER", "APPLE", "MUFFIN", "GLASS"],
            "randomClues": ["PROGRAMMING", "FRUIT"],
            "submissions": [
                { "player": "playerA", "words": ["BUNNY"] },
                { "player": "playerB", "words": ["LASER"] }
            ]
        },
        {
            "round": 2,
            "randomWords": ["MELON", "ORANGE", "APPLE", "GRAPE", "KIWI"],
            "randomClues": ["NATURAL", "SWEET"],
            "submissions": [
                { "player": "playerA", "words": ["APPLE"] },
                { "player": "playerB", "words": ["ORANGE"] }
            ]
        }
    ]
};
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
        const currentRound = initializeRound(gameID, totalWords, clues, wordsToGuess);
        console.log(`Started round ${currentRound}`);
        io.to(roomCode).emit("updateUI", rooms[roomCode].isGameStarted, gameState, gameID, currentRound);
    });

    socket.on("nextRoundReceived", (roomCode, gameID) => {
        console.log("next Round received");
        const totalWords = gameState[gameID].totalWords;
        const clues = gameState[gameID].clues;
        const wordsToGuess = gameState[gameID].wordsToGuess;
        console.log(`${totalWords} ${clues} ${wordsToGuess}`);
        const currentRound = initializeRound(gameID, totalWords, clues, wordsToGuess);
        console.log(`Started round ${currentRound}`);
        io.to(roomCode).emit("updateUI", rooms[roomCode].isGameStarted, gameState, gameID, currentRound);
    });

    socket.on("SubmitAnswerReceived", (selectedWords, currentUser, roomCode, currentGameID, currentRound) => {
        console.log(`Submit answer received from ${currentUser}`);
        const submissionObject = {
            player: currentUser,
            words: selectedWords,
            score: 0,
        };
        gameState[currentGameID].rounds[currentRound - 1].submissions.push(submissionObject);

        if (checkIfEveryoneSubmitted(roomCode, currentGameID, currentRound)) {
            io.to(roomCode).emit("returnAnswersSent", gameState, currentGameID, currentRound);
            computeAndUpdateRoundScore(currentGameID, currentRound);
        }

        // Emit update UI to reflect that the client who sent already submitted.
        // socket.emit()
    });

    socket.on("endGameReceived", (roomCode, currentGameID) => {
        rooms[roomCode].isGameStarted = false;
        // const playerScoresPerRound = [
        //     { name: "Wes", scores: [1, 4, 3] },
        //     { name: "Rens", scores: [2, 1, 4] },
        // ];
        console.log("End Game received");

        const playerScoresPerRound = [];

        const { rounds } = gameState[currentGameID];
        rounds.forEach(({ round }) => {
            console.log(round);
            const { submissions } = gameState[currentGameID].rounds[round - 1];
            submissions.forEach(({ player, score }) => {
                console.log(player);
                const playerIndex = playerScoresPerRound.findIndex((p) => p.name === player);
                if (playerIndex !== -1) {
                    console.log(`playerindex found ${playerIndex}`);
                    playerScoresPerRound[playerIndex].scores.push(score);
                } else {
                    console.log("playerindex not found");
                    playerScoresPerRound.push({ name: player, scores: [score] });
                }
            });
        });
        console.log(playerScoresPerRound);

        io.to(roomCode).emit("showScoreSent", playerScoresPerRound);
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
                totalWords: DEFAULTTOTALWORDS, // TODO REMOVE
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
            rounds: [],
        };
        return gameID;
    };

    const initializeRound = (gameID, totalWords, clues, wordsToGuess) => {
        const latestRound = gameState[gameID].rounds.length;
        const newRound = latestRound + 1;
        const shuffledArray = shuffleArray(wordsArray);
        const randomWordsArray = shuffledArray.slice(0, totalWords);
        const randomCluesArray = shuffledArray.slice(totalWords, totalWords + clues);

        const newRoundObject = {
            round: newRound,
            randomWords: randomWordsArray,
            randomClues: randomCluesArray,
            submissions: [],
        };

        gameState[gameID].rounds.push(newRoundObject);
        return newRound;
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

app.get("/games/:id/scores", (req, res) => {
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

const generateGameID = () => {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
};

const checkIfEveryoneSubmitted = (roomCode, gameID, currentRound) => {
    const numberOfPlayersSubmitted = gameState[gameID].rounds[currentRound - 1].submissions.length;
    const numberOfPlayersInRoom = rooms[roomCode].players.length;
    if (numberOfPlayersInRoom === numberOfPlayersSubmitted) {
        return true;
    } else {
        return false;
    }
};

// const computeAndUpdateRoundScore = (currentGameID, currentRound) => {
//     console.log("COMPUTEAND UPDATE ROUNDSCORE");
//     if (gameState[currentGameID].rounds[currentRound - 1].submissions.score) {
//         console.log("score found");
//         gameState[currentGameID].rounds[currentRound - 1].submissions.score = 21;
//         gameState[currentGameID].rounds[currentRound - 1].submissions.player = "X";
//     } else {
//         console.log("score not found");
//         gameState[currentGameID].rounds[currentRound - 1].submissions.score = 22;
//         gameState[currentGameID].rounds[currentRound - 1].submissions.player = "X";
//     }
// };

// const computeAndUpdateRoundScore = (currentGameID, currentRound) => {
//     console.log("COMPUTE AND UPDATE ROUND SCORE");
//     // Check if the submissions array exists for the current game round
//     if (!gameState[currentGameID].rounds[currentRound - 1].submissions) {
//         // If it doesn't exist, create an empty array
//         console.log("submission array found");
//         gameState[currentGameID].rounds[currentRound - 1].submissions = [];
//     } else {
//         console.log("submission array not found");
//     }

//     // Check if the score field exists
//     if (gameState[currentGameID].rounds[currentRound - 1].submissions[0].score !== undefined) {
//         console.log("Score found");
//         // Update the score and player fields
//         gameState[currentGameID].rounds[currentRound - 1].submissions[0].score = 21;
//         gameState[currentGameID].rounds[currentRound - 1].submissions[0].player = "X";
//     } else {
//         console.log("Score not found");
//         // Update the score and player fields
//         gameState[currentGameID].rounds[currentRound - 1].submissions[0].score = 22;
//         gameState[currentGameID].rounds[currentRound - 1].submissions[0].player = "X";
//     }
// };

// const computeAndUpdateRoundScore = (currentGameID, currentRound) => {
//     const wordsToGuess =gameState[currentGameID].wordsToGuess;
//     const submissions = gameState[currentGameID].rounds[currentRound - 1].submissions;

//     // submissions.map((submission) => {
//     //     return (submission.score = 21);
//     // });

//     for (let i = 0; i < submissions.length; i++) {
//         for (let j = 0; j< wordsToGuess; j++) {

//             const  = submissions[i].words[j];
//         }
//     }
// };

// function compareWords(currentGameID, currentRound) {
//     const { submissions } = gameState[currentGameID].rounds[currentRound - 1]; // Assuming only one round for simplicity
//     const comparedResults = {};

//     submissions.forEach((submission) => {
//         const { player, words } = submission;
//         const otherPlayers = submissions.filter((sub) => sub.player !== player);

//         comparedResults[player] = {};

//         otherPlayers.forEach((otherSubmission) => {
//             const { player: otherPlayer, words: otherWords } = otherSubmission;
//             const commonWords = words.filter((word) => otherWords.includes(word));

//             comparedResults[player][otherPlayer] = commonWords;
//         });
//     });

//     return comparedResults;
// }

function computeAndUpdateRoundScore(currentGameID, currentRound) {
    const { submissions } = gameState[currentGameID].rounds[currentRound - 1];

    submissions.forEach(({ player, words }) => {
        submissions.forEach(({ player: otherPlayer, words: otherWords }) => {
            if (player === otherPlayer) return;

            words.forEach((word) => {
                if (otherWords.includes(word)) {
                    const currentPlayerSubmission = submissions.find((submission) => submission.player === player);
                    if (currentPlayerSubmission) {
                        currentPlayerSubmission.score += 1;
                    }
                }
            });
        });
    });

    return gameState;
}
