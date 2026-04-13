import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { token, permissions } = useSelector((state) => state.auth);

 
  if (!token) return <Navigate to="/login" replace />;

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;