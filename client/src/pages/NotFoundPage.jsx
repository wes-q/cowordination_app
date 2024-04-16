import { NavLink } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="p-6">
            <h2 className="text-4xl mb-8">Page not found!</h2>
            <p className="mb-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia alias cupiditate ad nostrum doloribus iste tempora quisquam excepturi repellat, fugit cumque dolore magni possimus inventore neque provident! Sunt, quo eos?</p>

            <p className="mb-4">
                Go back to{" "}
                <NavLink to="/">
                    <span className="text-blue-700">Homepage</span>
                </NavLink>
                .
            </p>
        </div>
    );
};

export default NotFoundPage;
