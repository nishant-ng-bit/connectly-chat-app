import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { logoutUser } from "../api/auth.api";

const Navbar = () => {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuth();

  const submitHandler = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-semibold text-gray-100 tracking-wide flex items-center gap-2"
          >
            <span className="bg-linear-to-br from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-md">
              C
            </span>
            Connectly
          </Link>

          {/* Right side */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Profile
              </Link>

              <button
                onClick={submitHandler}
                className="
                  px-4 py-2 rounded-lg
                  bg-slate-800 text-gray-200
                  text-sm font-medium
                  hover:bg-slate-700 hover:text-white
                  transition
                "
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
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
                  bg-slate-800 text-gray-200
                  text-sm font-medium
                  hover:bg-slate-700 hover:text-white
                  transition
                "
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
