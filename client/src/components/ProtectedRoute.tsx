import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isloading } = useAuth();

  if (isloading) return <div className="bg-slate-900 h-screen">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
