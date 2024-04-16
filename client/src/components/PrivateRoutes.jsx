// import { Outlet, Navigate } from "react-router-dom";

// const PrivateRoutes = ({ isUserLoggedIn }) => {
//     // return (
//     //     <>
//     //         <h1>is user logged in?</h1>
//     //         {isUserLoggedIn && <h2>Yes</h2>}
//     //         {!isUserLoggedIn && <h2>No</h2>}
//     //     </>
//     // );
//     return isUserLoggedIn ? <Navigate to="/yes" /> : <Navigate to="/no" />;
// };

// export default PrivateRoutes;

// import { Outlet, Navigate } from "react-router-dom";

// const PrivateRoutes = ({ user, isLoadingUser }) => {
//     // Navigate only after finishing asynchronous fetching of user and there is no user fetched
//     return isLoadingUser ? <p>Loading...</p> : user ? <Outlet /> : <Navigate to="/login" />;
// };

// export default PrivateRoutes;

import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PrivateRoutes = ({ user, isUserLoggedIn }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to login page if user is not logged in
        if (!isUserLoggedIn) {
            navigate("/login");
        }
    }, [isUserLoggedIn]);

    // Render private routes here
    return (
        <>
            <Outlet />
        </>
    );
};

export default PrivateRoutes;
