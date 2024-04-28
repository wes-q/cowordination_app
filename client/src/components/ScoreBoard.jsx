const ScoreBoard = ({ playerScoresPerRound, setIsGameStarted }) => {
    // const playerScoresPerRound = [
    //     { name: "Wes", scores: [1, 4, 3] },
    //     { name: "Rens", scores: [2, 1, 4] },
    // ];

    // Find the rounds dynamically based on the length of scores of any player
    const rounds = playerScoresPerRound.reduce((acc, player) => {
        return player.scores.length > acc ? player.scores.length : acc;
    }, 0);

    const handleCloseScoreboard = () => {
        setIsGameStarted(false);
    };

    return (
        <div className="flex flex-col">
            <table className="mx-auto text-xs sm:text-base overflow-hidden border-spacing-0 border-separate text-light-background w-full max-w-[750px] shadow-md select-none rounded-lg">
                <thead className="bg-light-b dark:bg-dark-b">
                    <tr className="">
                        <td>Game Scores</td>
                        {playerScoresPerRound.map((player) => (
                            <td key={player.name}>{player.name}</td>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-light-a dark:bg-dark-a">
                    {[...Array(rounds)].map((_, index) => (
                        <tr key={index}>
                            <td>Round {index + 1}</td>
                            {playerScoresPerRound.map((player) => (
                                <td key={player.name}>{player.scores[index] || 0}</td>
                            ))}
                        </tr>
                    ))}
                    <tr>
                        <td>Game Total</td>
                        {playerScoresPerRound.map((player, playerIndex) => (
                            <td key={playerIndex}>{player.scores.reduce((acc, score) => acc + score, 0)}</td>
                        ))}
                    </tr>
                </tbody>
            </table>
            <button className="bg-primary dark:bg-primaryDark w-56 mt-4 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none transition-all" onClick={handleCloseScoreboard}>
                Close Scoreboard
            </button>
        </div>
    );
};

export default ScoreBoard;
