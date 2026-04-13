import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, permission }) => {  // ← rename prop
  const { token, permissions } = useSelector((state) => state.auth);

  if (!token) return <Navigate to="/login" replace />;

  if (permission && !permissions?.includes(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;