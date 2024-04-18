import { useParams } from "react-router-dom";

const RoomPage = ({ currentUser }) => {
    const { roomCode } = useParams();

    return (
        <>
            <h1>Room Page</h1>
            <h2>Logged in as: {currentUser}</h2>
            <h2>Room Code: {roomCode}</h2>
        </>
    );
};

export default RoomPage;
