import Footer from "../components/Footer";
import Login from "../components/Login";

const LoginPage = () => {
    return (
        <div className="flex flex-col justify-between h-screen overflow-hidden">
            <div></div>
            <div className="flex flex-col sm:flex-row justify-start sm:justify-around px-12 sm:p-0">
                <div></div>
                <div></div>
                <div className="flex justify-start sm:justify-end sm:w-[300px]">
                    <div></div>
                    <div className="flex items-center justify-center cursor-cell mb-10">
                        <div className="-skew-y-6 select-none sm:block">
                            <span className="font-handlee text-2xl font-extrabold italic text-cyan-950">Co</span>
                            <span className="font-handlee text-2xl font-extrabold italic text-cyan-400">word</span>
                            <span className="font-handlee text-2xl font-extrabold italic text-cyan-950">ination</span>
                        </div>
                    </div>
                </div>
                <div className="invisible sm:visible border-l-2"></div>
                <div>
                    <Login />
                </div>
                <div></div>
                <div></div>
            </div>
            <Footer />
        </div>
    );
};

export default LoginPage;
