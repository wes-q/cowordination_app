const PlayersInRoom = ({ players }) => {
    return (
        <div className="border h-full w-96">
            <h1>Players in Room:</h1>
            <ul>
                {players.map((player, index) => {
                    return <li key={index}>{player}</li>;
                })}
            </ul>
        </div>
    );
};

export default PlayersInRoom;
