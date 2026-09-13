import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { hasRequiredRole, roleHomePath } from "../routing/access";

export function ProtectedRoute({ allowedRoles, children }) {
  const { accessToken, currentUser } = useSelector((state) => state.auth);

  if (!accessToken || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRole(currentUser, allowedRoles)) {
    return <Navigate to={roleHomePath(currentUser)} replace />;
  }

  return children;
}
