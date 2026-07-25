import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ children, allowedRoles }) => {
    const { user, token, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleRoute;