import { useState, useEffect, useRef } from "react";
import PlayersInGame from "./PlayersInGame";
import { socket } from "../socket";

const GameBoard = ({ randomWords, randomClues, wordsToGuess, players, currentUser, roomCode, currentGameID, currentRound, isSubmitted, setIsSubmitted, hasEveryoneSubmitted, setHasEveryoneSubmitted }) => {
    const [isReadyForSubmission, setIsReadyForSubmission] = useState(false);
    const [selectedButtons, setSelectedButtons] = useState({});

    // const wordData = {
    //     "quirked": {
    //         isSelected: false,
    //         answeredBy: []
    //     },
    //     "steenstrupine": {
    //         isSelected: false,
    //         answeredBy: []
    //     },
    //     "taffylike": {
    //         isSelected: false,
    //         answeredBy: []
    //     },
    // };

    // "submissions": [
    //     {
    //       "player": "Wes",
    //       "words": [
    //         "quirked",
    //         "steenstrupine"
    //       ]
    //     },
    //     {
    //       "player": "ICE",
    //       "words": [
    //         "taffylike",
    //         "quirked"
    //       ]
    //     }
    //   ]

    // When all players submitted their answers, update the buttons to reflect who voted which words.
    useEffect(() => {
        socket.on("returnAnswersSent", (gameState, currentGameID, currentRound) => {
            setHasEveryoneSubmitted(true);
            const updatedSelectedButtons = { ...selectedButtons };

            console.log("returnAnswersSent");
            const otherPlayersSubmissionsArray = gameState[currentGameID].rounds[currentRound - 1].submissions.filter((submission) => submission.player !== currentUser);
            console.log(otherPlayersSubmissionsArray);

            otherPlayersSubmissionsArray.forEach((submission) => {
                const { player, words } = submission;

                words.forEach((word) => {
                    console.log(`word: ${word}`);
                    console.log(`player: ${player}`);
                    if (!updatedSelectedButtons[word].answeredBy.includes(player)) {
                        updatedSelectedButtons[word].answeredBy.push(player);
                    }
                });
            });
            setSelectedButtons(updatedSelectedButtons);
        });

        return () => {
            socket.off("returnAnswersSent");
        };
    }, [selectedButtons]);

    const submittedButtonCSS = useRef(`bg-green-400 hover:cursor-not-allowed ml-2 w-56 mt-4 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all`);
    const readyForSubmissionButtonCSS = useRef(`bg-primary dark:bg-primaryDark ml-2 w-56 mt-4 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all`);
    const notReadyForSubmissionButtonCSS = useRef(`bg-neutral hover:cursor-not-allowed dark:bg-primaryDark ml-2 w-56 mt-4 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all`);

    // Converts randomwords array into object {word: boolean} where boolean = isSelected
    useEffect(() => {
        setSelectedButtons(Object.fromEntries(randomWords.map((word) => [word, { isSelected: false, answeredBy: [] }])));
    }, [randomWords]);

    // Sets the css and disabled property of the submit button depending on condition (if the user selected the correct number of words to guess)
    useEffect(() => {
        const selectedCount = Object.entries(selectedButtons).filter(([word, data]) => data.isSelected).length;

        if (selectedCount === wordsToGuess) {
            setIsReadyForSubmission(true);
        } else {
            setIsReadyForSubmission(false);
        }
    }, [selectedButtons]);

    const toggleButton = (word) => {
        setSelectedButtons({
            ...selectedButtons,
            [word]: {
                ...selectedButtons[word],
                isSelected: !selectedButtons[word]?.isSelected,
            },
        });
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        const selectedWords = [];

        Object.entries(selectedButtons).forEach(([word, data]) => {
            if (data.isSelected) {
                selectedWords.push(word);
            }
        });

        console.log(`selectedWords ${selectedWords}`);
        socket.emit("SubmitAnswerReceived", selectedWords, currentUser, roomCode, currentGameID, currentRound);
        console.log(`Submitted answer to server ${selectedWords}`);
    };

    const handleNextRound = () => {
        socket.emit("nextRoundReceived", roomCode, currentGameID);
        setIsSubmitted(false);
        setHasEveryoneSubmitted(false);
        console.log("Emitted next round Received");
    };

    const handleEndGame = () => {
        alert("end game");
    };

    return (
        <div className="relative z-10 select-none">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            <div className="fixed inset-0 z-10 flex flex-col items-center justify-center">
                <div className="flex flex-col p-4 text-center justify-center w-full sm:w-[1200px] h-auto rounded-md bg-light-b dark:bg-dark-b shadow-xl">
                    <div className="flex items-center justify-between w-full mb-4">
                        <span className="font-bold">Round: {currentRound} </span>
                        <span className="font-bold">Choose {wordsToGuess} words</span>
                    </div>
                    <hr className="w-full border-t border-light-c dark:border-dark-a mb-4" />
                    <span className="font-bold mb-4">Clues: </span>
                    <div className="flex gap-4 justify-center mb-4">
                        {randomClues.map((clue) => (
                            <div key={clue} className="h-28 w-56 border border-black bg-neutral rounded-md py-10 cursor-not-allowed">
                                {clue}
                            </div>
                        ))}
                    </div>
                    <hr className="w-full border-t border-light-c dark:border-dark-a mb-4" />
                    <div className="grid grid-cols-5 gap-4">
                        {Object.entries(selectedButtons).map(([word, { isSelected, answeredBy }]) => (
                            <button key={word} className={selectedButtons[word]?.isSelected ? "h-28 w-56 relative rounded-md border border-orange-400 bg-orange-400 text-white py-10 disabled:cursor-not-allowed" : "h-28 w-56 relative rounded-md border border-orange-400 py-10 disabled:cursor-not-allowed"} onClick={() => toggleButton(word)} disabled={isSubmitted}>
                                <span className={hasEveryoneSubmitted ? "absolute bottom-0 right-0 px-2 py-2" : ""}>{word}</span>
                                <ul className="absolute top-0 left-0">
                                    {answeredBy.map((player, index) => (
                                        <li key={index} className="text-xs text-gray-500 px-2 py-1">
                                            {player}
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        ))}
                    </div>
                    {!hasEveryoneSubmitted && (
                        <button onClick={handleSubmit} className={isSubmitted ? submittedButtonCSS.current : isReadyForSubmission ? readyForSubmissionButtonCSS.current : notReadyForSubmissionButtonCSS.current} type="button" disabled={isSubmitted ? true : isReadyForSubmission ? false : true}>
                            {isSubmitted ? "Waiting for other players..." : "Submit"}
                        </button>
                    )}
                    {hasEveryoneSubmitted && (
                        <div className="flex justify-between">
                            <button onClick={handleNextRound} className="bg-primary dark:bg-primaryDark ml-2 w-44 mt-4 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button">
                                Next Round
                            </button>
                            <button onClick={handleEndGame} className="bg-neutral dark:bg-primaryDark ml-2 w-44 mt-4 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button">
                                End Game
                            </button>
                        </div>
                    )}
                    {/* <PlayersInGame players={players} /> */}
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
