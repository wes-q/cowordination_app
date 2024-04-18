import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { socket } from "../socket";

const LobbyPage = ({ currentUser }) => {
    const [roomCode, setRoomCode] = useState("");
    const [currentRoomCode, setCurrentRoomCode] = useState("");
    const navigate = useNavigate();
    const MAXLENGTHOFROOMCODE = 4;

    // useEffect(() => {
    //     socket.on("sayHello", (message) => {
    //         console.log("Broadcasted message:", message);
    //     });

    //     return () => {
    //         socket.disconnect();
    //     };
    // }, []);

    const logout = () => {
        window.localStorage.removeItem("loggedUserName");
        navigate("/login");
    };

    const handleChange = (event) => {
        const capitalizedValue = event.target.value.toUpperCase();
        if (event.target.value.length <= MAXLENGTHOFROOMCODE) {
            setRoomCode(capitalizedValue);
        }
    };

    const handleJoinRoom = (roomCode) => {
        navigate(`/room/${roomCode}`);
    };

    const handleCreateRoom = () => {
        const roomCode = generateRoomCode();
        socket.emit("joinRoom", roomCode, currentUser);
        // handle duplicate room codes here
        // navigate("/room");
        handleJoinRoom(roomCode);
    };

    const handleBroadcast = () => {
        alert();
        socket.emit("broadcast");
    };

    function generateRoomCode() {
        return Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    return (
        <>
            <h1>Lobby Page</h1>
            <h2>Logged in as: {currentUser}</h2>
            <h3 onClick={logout}>Logout</h3>
            <div className="flex flex-col w-48 items-center">
                <button className="ml-2 w-full bg-cyan-400 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button" onClick={() => handleCreateRoom()}>
                    Create a Room
                </button>
                <span>or</span>
                <button className="ml-2 w-full bg-cyan-400 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button" onClick={() => handleJoinRoom()}>
                    Join Room
                </button>
                <input type="text" name="roomCode" value={roomCode} onChange={handleChange} className="text-center mt-1 w-full px-3 py-2 bg-white border shadow-sm border-slate-400 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-cyan-400 rounded-md sm:text-sm focus:ring-1" placeholder="Room Code" autoFocus autoCapitalize="characters" spellCheck="false" />
            </div>
        </>
    );
};

export default LobbyPage;
