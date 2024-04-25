import { useState, useEffect } from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import PrivateRoutes from "./components/PrivateRoutes";
import LobbyPage from "./pages/LobbyPage";
import RoomPage from "./pages/RoomPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import { socket } from "./socket";

const App = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState("");
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    const [players, setPlayers] = useState([]);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [randomWords, setRandomWords] = useState([]);
    const [wordsToGuess, setWordsToGuess] = useState(0);
    const [currentGameID, setCurrentGameID] = useState("");
    const [currentRound, setCurrentRound] = useState(0);
    const [allSubmissionsForCurrentRound, setAllSubmissionsForCurrentRound] = useState([]);

    useEffect(() => {
        socket.on("broadcastSent", (message) => {
            console.log("Broadcasted message:", message);
        });
        socket.on("updatePlayerList", (updatedPlayers) => {
            console.log("UPDATED PLAYER LIST");
            setPlayers(updatedPlayers);
        });

        socket.on("updateUI", (isGameStarted, gameState, currentGameID, currentRound) => {
            console.log(currentRound);
            setCurrentRound(currentRound);
            setCurrentGameID(currentGameID);

            const randomWords = gameState[currentGameID].rounds[currentRound - 1].randomWords;

            console.log("Update UI Sent");
            console.log(randomWords);
            setRandomWords(randomWords);
            setWordsToGuess(gameState[currentGameID].wordsToGuess);
            setIsGameStarted(isGameStarted);
        });
        socket.on("returnAnswersSent", (gameState, currentGameID, currentRound) => {
            console.log("returnAnswersSent");
            // const otherPlayersSubmissionsArray = gameState[currentGameID].rounds[currentRound - 1].submissions.filter((submission) => submission.player !== currentUser);
            setAllSubmissionsForCurrentRound(gameState[currentGameID].rounds[currentRound - 1].submissions);
        });

        return () => {
            socket.off("broadcastSent");
            socket.off("updatePlayerList");
            socket.off("updateUI");
        };
    }, []);

    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);

    useEffect(() => {
        getLocalUserFromBrowser();
    }, [currentUser]);

    const getLocalUserFromBrowser = () => {
        const loggedUserName = window.localStorage.getItem("loggedUserName");
        if (loggedUserName) {
            setCurrentUser(loggedUserName);
            setIsUserLoggedIn(true);
        }
    };

    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                <Route element={isUserLoggedIn ? <PrivateRoutes isUserLoggedIn={isUserLoggedIn} /> : <LoginPage />}>
                    <Route index element={<LobbyPage currentUser={currentUser} />} />
                    <Route path="room/:roomCode" element={<RoomPage currentUser={currentUser} players={players} randomWords={randomWords} wordsToGuess={wordsToGuess} currentGameID={currentGameID} currentRound={currentRound} isGameStarted={isGameStarted} allSubmissionsForCurrentRound={allSubmissionsForCurrentRound} />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
                <Route path="login" element={<LoginPage />} />
            </>
        )
    );

    return <RouterProvider router={router} />;
};

export default App;
