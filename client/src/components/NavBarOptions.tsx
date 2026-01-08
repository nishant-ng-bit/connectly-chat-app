import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoCloseSharp } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { logoutUser } from "../api/auth.api";
import ThemeToggle from "./ThemeToggle";

const NavBarOptions = () => {
  const { isAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/", { replace: true });
      setOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative sm:hidden z-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-xl text-slate-900 dark:text-gray-100"
      >
        {open ? <IoCloseSharp /> : <GiHamburgerMenu />}
      </button>

      {open && (
        <div
          className="
            absolute top-10 right-0
            w-44
            bg-white dark:bg-slate-900
            border border-gray-200 dark:border-slate-800
            rounded-xl shadow-lg
            p-2
            flex flex-col gap-1
          "
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="
                  block px-4 py-2 rounded-lg
                  text-slate-700 dark:text-gray-200
                  hover:bg-slate-100 dark:hover:bg-slate-800
                  transition
                "
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="
                  text-left w-full
                  px-4 py-2 rounded-lg
                  text-slate-700 dark:text-gray-200
                  hover:bg-slate-100 dark:hover:bg-slate-800
                  transition
                "
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="
                  block px-4 py-2 rounded-lg
                  text-slate-700 dark:text-gray-200
                  hover:bg-slate-100 dark:hover:bg-slate-800
                  transition
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="
                  block px-4 py-2 rounded-lg
                  text-slate-700 dark:text-gray-200
                  hover:bg-slate-100 dark:hover:bg-slate-800
                  transition
                "
              >
                Register
              </Link>
            </>
          )}

          <div className="h-px bg-gray-200 dark:bg-slate-700 my-1" />

          <div className="flex justify-between items-center px-4 py-2">
            <span className="text-sm text-slate-600 dark:text-gray-400">
              Theme
            </span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBarOptions;
