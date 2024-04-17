import { useState, useEffect } from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import PrivateRoutes from "./components/PrivateRoutes";
import LobbyPage from "./pages/LobbyPage";
import RoomPage from "./pages/RoomPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import io from "socket.io-client";

const App = () => {
    const [currentUser, setCurrentUser] = useState("");
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    useEffect(() => {
        // Connect to Socket.io server
        const socket = io("http://localhost:3002");

        // Listen for 'message' event from server
        socket.on("message", (message) => {
            console.log("Received message:", message);
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
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
                {/* <Route element={<PrivateRoutes user={currentUser} isUserLoggedIn={isUserLoggedIn} />}> */}
                <Route element={isUserLoggedIn ? <PrivateRoutes isUserLoggedIn={isUserLoggedIn} /> : <LoginPage />}>
                    <Route index element={<LobbyPage currentUser={currentUser} />} />
                    {/* <Route path="room/:RoomId" element={<RoomPage currentUser />} /> */}
                </Route>
                <Route path="*" element={<NotFoundPage />} />
                <Route path="login" element={<LoginPage />} />
            </>
        )
    );

    return <RouterProvider router={router} />;
};

export default App;
