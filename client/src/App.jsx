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

    useEffect(() => {
        socket.on("broadcastSent", (message) => {
            console.log("Broadcasted message:", message);
        });
        socket.on("updatePlayerList", (updatedPlayers) => {
            console.log("UPDATED PLAYER LIST");
            setPlayers(updatedPlayers);
        });
        socket.on("startGameSent", () => {
            console.log("Started Game");
            setIsGameStarted(true);
        });
        socket.on("endGameSent", () => {
            console.log("Ended Game");
            setIsGameStarted(false);
        });

        return () => {
            socket.off("broadcastSent");
            socket.off("updatePlayerList");
            socket.off("startGameSent");
            socket.off("endGameSent");
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
    }, []);

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
                    <Route path="room/:roomCode" element={<RoomPage currentUser={currentUser} players={players} isGameStarted={isGameStarted} />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
                <Route path="login" element={<LoginPage />} />
            </>
        )
    );

    return <RouterProvider router={router} />;
};

export default App;
