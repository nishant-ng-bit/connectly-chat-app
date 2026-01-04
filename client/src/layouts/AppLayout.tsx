import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
const AppLayout = () => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
