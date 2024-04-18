import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket";

const RoomPage = ({ currentUser }) => {
    const { roomCode } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("broadcast", (message) => {
            console.log("Broadcasted message:", message);
        });
        return () => {
            socket.off("broadcast");
        };
    }, []);

    const handleLeaveRoom = () => {
        socket.emit("leaveRoom", roomCode, currentUser);
        navigate("/");
    };

    const handleBroadcast = () => {
        socket.emit("broadcast", roomCode, currentUser);
    };

    return (
        <div className="flex flex-col">
            <h1>Room Page</h1>
            <h2>Logged in as: {currentUser}</h2>
            <h2>Room Code: {roomCode}</h2>
            <span onClick={handleLeaveRoom}>Leave Room</span>
            <button className="ml-2 w-96 bg-cyan-400 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button" onClick={() => handleBroadcast()}>
                Broadcast to Everyone in Room
            </button>
        </div>
    );
};

export default RoomPage;
