import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket";
import PlayersInRoom from "../components/PlayersInRoom";

const RoomPage = ({ currentUser, players, isGameStarted }) => {
    const { roomCode } = useParams();
    const navigate = useNavigate();

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

    const handleEndGame = () => {
        socket.emit("endGameReceived", roomCode);
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
                {isGameStarted ? (
                    <button className="ml-2 w-96 bg-cyan-400 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button" onClick={() => handleEndGame(roomCode)}>
                        End Game
                    </button>
                ) : (
                    <button className="ml-2 w-96 bg-cyan-400 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button" onClick={() => handleStartGame(roomCode)}>
                        Start Game
                    </button>
                )}
                {isGameStarted && <span>Game started!</span>}
            </div>
            <div className="flex flex-col">
                <PlayersInRoom players={players} />
            </div>
        </div>
    );
};

export default RoomPage;
