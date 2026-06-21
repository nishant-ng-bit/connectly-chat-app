import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../providers/AuthProvider";
import { LoadingPage } from "../pages";

const AppLayout = () => {
  const { isloading } = useAuth();
  const location = useLocation();
  const isChatsPage = location.pathname.startsWith("/chats");

  if (isloading) return <LoadingPage />;
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className={`flex-1 ${isChatsPage ? "overflow-hidden" : "overflow-y-auto no-scrollbar"}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
