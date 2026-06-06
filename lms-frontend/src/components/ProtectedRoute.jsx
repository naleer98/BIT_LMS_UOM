import { Navigate } from "react-router-dom";

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("bitLmsUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("bitLmsUser");
    localStorage.removeItem("bitLmsToken");
    return null;
  }
}

function getDashboardPath(role) {
  if (role === "admin") return "/admin-dashboard";
  if (role === "teacher") return "/teacher-dashboard";
  return "/student-dashboard";
}

function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("bitLmsToken");
  const user = getStoredUser();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;