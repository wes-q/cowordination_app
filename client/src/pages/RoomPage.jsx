import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket";
import PlayersInRoom from "../components/PlayersInRoom";
// import axios from "axios";

const RoomPage = ({ currentUser }) => {
    const [players, setPlayers] = useState([]);
    const { roomCode } = useParams();
    const [isGameStarted, setIsGameStarted] = useState(false);
    const navigate = useNavigate();

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

        // fetchPlayersInRoom(roomCode);
        // socket.emit("joinRoom", roomCode, currentUser); // try this for autojoin

        return () => {
            socket.off("broadcastSent");
            socket.off("updatePlayerList");
            socket.off("startGameSent");
            // socket.emit("leaveRoom", roomCode, currentUser); // try later for auto logout
        };
    }, []);

    // const fetchPlayersInRoom = async (roomCode) => {
    //     try {
    //         const playersInRoom = await axios.get(`http://localhost:3002/rooms/${roomCode}`, { "Content-Type": "application/json" });
    //         setPlayers(playersInRoom.data);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    // useEffect(() => {
    //     autoJoinRoom(roomCode);
    // }, []);

    // const autoJoinRoom = (roomCodeToJoin) => {
    //     socket.emit("joinRoom", roomCodeToJoin, currentUser);
    //     navigate(`/room/${roomCodeToJoin}`);
    // };

    const handleLeaveRoom = () => {
        console.log("Handle leave room");
        socket.emit("leaveRoom", roomCode, currentUser);
        navigate("/");
    };

    const handleBroadcast = () => {
        socket.emit("broadcastReceived", roomCode, currentUser);
    };

    const handleStartGame = () => {
        socket.emit("startGameReceived", roomCode);
    };

    return (
        <div className="flex">
            <div className="flex flex-col gap-1">
                <h1>Room Page</h1>
                <h2>Logged in as: {currentUser}</h2>
                <h2>Room Code: {roomCode}</h2>
                <span onClick={() => handleLeaveRoom()}>Leave Room</span>
                <button className="ml-2 w-96 bg-cyan-400 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button" onClick={() => handleBroadcast()}>
                    Broadcast to Everyone in Room
                </button>
                <button className="ml-2 w-96 bg-cyan-400 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button" onClick={() => handleStartGame(roomCode)}>
                    Start Game
                </button>
                {isGameStarted && <span>Game started!</span>}
            </div>
            <div className="flex flex-col">
                <PlayersInRoom players={players} />
            </div>
        </div>
    );
};

export default RoomPage;
