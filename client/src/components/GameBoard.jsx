import { useState, useEffect, useRef } from "react";
import PlayersInGame from "./PlayersInGame";
import { socket } from "../socket";

const GameBoard = ({ randomWords, wordsToGuess, players, currentUser, roomCode, currentGameID, currentRound, allSubmissionsForCurrentRound }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
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

    const submittedButtonCSS = useRef(`bg-green-400 text-white hover:cursor-not-allowed ml-2 w-44 mt-4 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all`);
    const readyForSubmissionButtonCSS = useRef(`bg-primary dark:bg-primaryDark ml-2 w-44 mt-4 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all`);
    const notReadyForSubmissionButtonCSS = useRef(`bg-neutral text-white hover:cursor-not-allowed dark:bg-primaryDark ml-2 w-44 mt-4 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all`);

    // Converts randomwords array into object {word: boolean} where boolean = isSelected
    useEffect(() => {
        setSelectedButtons(Object.fromEntries(randomWords.map((word) => [word, false])));
        // setSelectedButtons(Object.fromEntries(randomWords.map((word) => [word, { isSelected: false, answeredBy: [] }])));
    }, [randomWords]);

    // useEffect(() => {
    //     // setSelectedButtons(Object.fromEntries(randomWords.map((word) => [word, false])));
    //     setSelectedButtons(Object.fromEntries(randomWords.map((word) => [word, { isSelected: false, answeredBy: [] }])));
    // }, [allSubmissionsForCurrentRound]);

    // Sets the css and disabled property of the submit button depending on condition (if the user selected the correct number of words to guess)
    useEffect(() => {
        // const selectedCount = Object.values(selectedButtons).filter(Boolean).length;
        const selectedCount = Object.entries(selectedButtons).filter(([word, data]) => data.isSelected).length;

        if (selectedCount === wordsToGuess) {
            setIsReadyForSubmission(true);
        } else {
            setIsReadyForSubmission(false);
        }
    }, [selectedButtons]);

    const toggleButton = (buttonName) => {
        setSelectedButtons({
            ...selectedButtons,
            [buttonName]: !selectedButtons[buttonName],
        });
    };

    // const toggleButton = (word) => {
    //     setSelectedButtons({
    //         ...selectedButtons,
    //         [word]: {
    //             ...selectedButtons[word],
    //             isSelected: !selectedButtons[word]?.isSelected,
    //         },
    //     });
    // };

    const handleSubmit = () => {
        setIsSubmitted(true);
        const selectedWords = Object.entries(selectedButtons)
            .filter(([word, isSelected]) => isSelected)
            .map(([word]) => word);
        socket.emit("SubmitAnswerReceived", selectedWords, currentUser, roomCode, currentGameID, currentRound);
        console.log(`Submitted answer to server ${selectedWords}`);
    };

    return (
        <div className="relative z-10 select-none">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            <div className="fixed inset-0 z-10 flex flex-col items-center justify-center">
                <div className="flex flex-col p-4 text-center justify-center w-full sm:w-[450px] h-auto rounded-md bg-light-b dark:bg-dark-b shadow-xl">
                    <div className="flex items-center justify-between w-full mb-4">
                        <span className="font-bold">Round: </span>
                        <span>Choose {wordsToGuess} words</span>
                    </div>

                    <hr className="w-full border-t border-light-c dark:border-dark-a mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                        {randomWords.map((buttonName) => (
                            <button key={buttonName} className={selectedButtons[buttonName] ? "rounded-md border border-orange-400 bg-orange-400 text-white py-10 disabled:cursor-not-allowed" : "rounded-md border border-orange-400 py-10 disabled:cursor-not-allowed"} onClick={() => toggleButton(buttonName)} disabled={isSubmitted}>
                                {buttonName}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleSubmit} className={isSubmitted ? submittedButtonCSS.current : isReadyForSubmission ? readyForSubmissionButtonCSS.current : notReadyForSubmissionButtonCSS.current} type="button" disabled={isSubmitted ? true : isReadyForSubmission ? false : true}>
                        {isSubmitted ? "Submitted" : "Submit"}
                    </button>
                    <PlayersInGame players={players} />
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
