import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { cookie } from "../utils/cookie";

const ProtectedRoute = ({ children, permission, allowedRoles }) => {
  const { token, permissions, role: storeRole } = useSelector(
    (state) => state.auth,
  );
  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles?.length) {
    const role = String(storeRole || cookie.get("role") || "");
    const normalized = role.toLowerCase();
    const ok = allowedRoles.some(
      (r) => r === role || String(r).toLowerCase() === normalized,
    );
    if (!ok) return <Navigate to="/403" replace />;
  }

  if (permission && !permissions?.includes(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;