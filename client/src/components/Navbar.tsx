import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { logoutUser } from "../api/auth.api";
import ThemeToggle from "./ThemeToggle";
import NavBarOptions from "./NavBarOptions";

const Navbar = () => {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuth();

  const submitHandler = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav
      className="
        bg-white dark:bg-slate-950
        border-b border-gray-200 dark:border-slate-800
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          <Link
            to="/"
            className="
              text-xl font-semibold
              text-slate-900 dark:text-gray-100
              tracking-wide flex items-center gap-2
            "
          >
            <span className="bg-linear-to-br from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-md">
              C
            </span>
            Connectly
          </Link>

          <div className="hidden sm:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="
                    text-sm
                    text-slate-600 dark:text-gray-300
                    hover:text-slate-900 dark:hover:text-white
                    transition
                  "
                >
                  Profile
                </Link>

                <button
                  onClick={submitHandler}
                  className="
                    px-4 py-2 rounded-lg
                    bg-slate-200 dark:bg-slate-800
                    text-slate-800 dark:text-gray-200
                    text-sm font-medium
                    hover:bg-slate-300 dark:hover:bg-slate-700
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
                  className="
                    px-4 py-2 rounded-lg
                    bg-indigo-600 text-white
                    text-sm font-medium
                    hover:bg-indigo-700
                    transition
                  "
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="
                    px-4 py-2 rounded-lg
                    bg-slate-200 dark:bg-slate-800
                    text-slate-800 dark:text-gray-200
                    text-sm font-medium
                    hover:bg-slate-300 dark:hover:bg-slate-700
                    transition
                  "
                >
                  Register
                </Link>
              </>
            )}

            <ThemeToggle />
          </div>

          <NavBarOptions />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
