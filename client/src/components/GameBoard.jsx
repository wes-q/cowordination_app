import { useState, useEffect } from "react";

const GameBoard = ({ randomWords, wordsToGuess }) => {
    const [submitButtonCSS, setSubmitButtonCSS] = useState("bg-neutral hover:cursor-not-allowed"); // State to manage the background color
    const [isDisabled, setIsDisabled] = useState(true);
    const [selectedButtons, setSelectedButtons] = useState(Object.fromEntries(randomWords.map((word) => [word, false])));

    const toggleButton = (buttonName) => {
        setSelectedButtons({
            ...selectedButtons,
            [buttonName]: !selectedButtons[buttonName],
        });
    };

    useEffect(() => {
        const selectedCount = Object.values(selectedButtons).filter(Boolean).length;
        if (selectedCount === wordsToGuess) {
            setSubmitButtonCSS("bg-primary dark:bg-primaryDark");
            setIsDisabled(false);
        } else {
            setSubmitButtonCSS("bg-neutral text-white hover:cursor-not-allowed");
            setIsDisabled(true);
        }
    }, [selectedButtons]);

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
                            <button key={buttonName} className={selectedButtons[buttonName] ? "rounded-md border border-orange-400" : ""} onClick={() => toggleButton(buttonName)}>
                                {buttonName}
                            </button>
                        ))}
                    </div>
                    <button className={`${submitButtonCSS} ml-2 w-44 mt-4 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all`} type="button" disabled={isDisabled}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
