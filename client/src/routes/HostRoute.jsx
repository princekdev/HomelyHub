import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const HostRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== "host" && user.role !== "admin") {
    return <Navigate to="/become-host" replace />;
  }
  return children;
};

export default HostRoute;
