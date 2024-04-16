import { useNavigate } from "react-router-dom";
import { useState } from "react";

const LobbyPage = ({ currentUser }) => {
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();
    const MAXLENGTHOFROOMID = 4;

    const logout = () => {
        window.localStorage.removeItem("loggedUserName");
        navigate("/login");
    };

    const handleChange = (event) => {
        const capitalizedValue = event.target.value.toUpperCase();
        if (event.target.value.length <= MAXLENGTHOFROOMID) {
            setRoomId(capitalizedValue);
        }
    };

    const handleJoinRoom = (event) => {
        alert("join");
    };

    const handleCreateRoom = (event) => {
        alert("Create");
    };

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
                <input type="text" name="roomId" value={roomId} onChange={handleChange} className="text-center mt-1 w-full px-3 py-2 bg-white border shadow-sm border-slate-400 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-cyan-400 rounded-md sm:text-sm focus:ring-1" placeholder="Room ID" autoFocus autoCapitalize="characters" spellCheck="false" />
            </div>
        </>
    );
};

export default LobbyPage;
