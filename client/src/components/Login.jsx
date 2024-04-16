import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Login = () => {
    const [name, setName] = useState("");

    const navigate = useNavigate();

    const handleSubmit = () => {
        window.localStorage.setItem("loggedUserName", name);
        navigate("/");
        navigate(0);
    };

    const handleChange = (event) => {
        setName(event.target.value);
    };

    return (
        <section className="w-auto sm:w-[300px] text-slate-600 text-sm font-medium bg-white rounded-lg mx-auto">
            <div className="h-52">
                <label className="block">
                    <span>Login as</span>
                    <div className="relative">
                        <input type="text" name="name" value={name} onChange={handleChange} className="mt-1 mb-2 px-3 py-2 bg-white border shadow-sm border-slate-400 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-cyan-400 block w-full rounded-md sm:text-sm focus:ring-1" placeholder="Name" autoFocus spellCheck="false" />
                    </div>
                </label>

                <button className="w-1/2 sm:w-full bg-cyan-400 hover:ring-cyan-500 hover:ring-1 hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none mr-2 transition-all" type="button" onClick={() => handleSubmit()}>
                    Login
                </button>
            </div>
        </section>
    );
};

export default Login;
