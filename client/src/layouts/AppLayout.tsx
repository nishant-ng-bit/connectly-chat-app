import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../providers/AuthProvider";
import { LoadingPage } from "../pages";

const AppLayout = () => {
  const { isloading } = useAuth();

  if (isloading) return <LoadingPage />;
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
