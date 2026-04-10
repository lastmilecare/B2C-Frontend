import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { token, permissions } = useSelector((state) => state.auth);

  // Not logged in
  if (!token) return <Navigate to="/login" replace />;

  // Permission check if required
  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;