// component/route/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { auth, apploading } = useContext(AuthContext);
  const location = useLocation();

  if (apploading) return <div>Loading...</div>;

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
