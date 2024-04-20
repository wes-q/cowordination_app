import { IoIosCloseCircleOutline } from "react-icons/io";
import { IconContext } from "react-icons";
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";

const ModalSettings = ({ setShowSettings }) => {
    const handleClose = () => {
        setShowSettings(false);
    };

    return (
        <div className="relative z-10 select-none">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            <div className="fixed inset-0 z-10 flex flex-col items-center justify-center">
                <div className="flex flex-col p-4 text-center justify-center w-full sm:w-[450px] h-auto rounded-md bg-light-b dark:bg-dark-b shadow-xl">
                    <div className="flex items-center justify-between w-full mb-4">
                        <span className="font-bold">Game Settings</span>
                        <IconContext.Provider value={{ className: "global-class-name cursor-pointer", size: "25px" }}>
                            <div>
                                <IoIosCloseCircleOutline className="cursor-pointer fill-current" onClick={handleClose} />
                            </div>
                        </IconContext.Provider>
                    </div>

                    <hr className="w-full border-t border-light-c dark:border-dark-a mb-4" />

                    <div className="flex flex-col items-center justify-between w-full px-20">
                        <div className="flex items-center justify-between w-full">
                            <span>Total Words</span>
                            <div className="flex items-center gap-4">
                                <FaAngleLeft />
                                <span className="w-6">10</span>
                                <FaAngleRight />
                            </div>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <span>Clues</span>
                            <div className="flex items-center gap-4">
                                <FaAngleLeft />
                                <span className="w-6">2</span>
                                <FaAngleRight />
                            </div>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <span>Words to Guess</span>
                            <div className="flex items-center gap-4">
                                <FaAngleLeft />
                                <span className="w-6">1</span>
                                <FaAngleRight />
                            </div>
                        </div>
                        <button className="ml-2 w-44 mt-4 bg-cyan-400 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button" onClick={() => handleStartGame(roomCode)}>
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalSettings;
