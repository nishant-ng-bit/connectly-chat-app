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
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold text-slate-900 dark:text-gray-100 tracking-tight flex items-center gap-2.5 group"
          >
            <span className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white w-9 h-9 rounded-xl flex items-center justify-center font-extrabold shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              C
            </span>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
              Connectly
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/chats"
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  Chats
                </Link>

                <Link
                  to="/profile"
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  Profile
                </Link>

                <button
                  onClick={submitHandler}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold border border-slate-200/50 dark:border-slate-800/80 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-800/80" />
            <ThemeToggle />
          </div>

          <NavBarOptions />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
