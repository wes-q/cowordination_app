import { useState, useEffect, useRef } from "react";

const PlayersInGame = ({ players }) => {
    const [submittedPlayers, setSubmittedPlayers] = useState({});

    // Converts randomwords array into object {word: boolean} where boolean = isSelected
    useEffect(() => {
        setSubmittedPlayers(Object.fromEntries(players.map((player) => [player, false])));
    }, [players]);

    const handlePlayer = (buttonName) => {
        setSelectedButtons({
            ...selectedButtons,
            [buttonName]: !selectedButtons[buttonName],
        });
    };

    return (
        <div className="border h-full w-96">
            <h1>Players in Room:</h1>
            <ul>
                {players.map((player, index) => {
                    return (
                        <li key={index}>
                            {player}
                            {/* {hasSubmitted ? "Waiting" : "Thinking"} */}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PlayersInGame;
