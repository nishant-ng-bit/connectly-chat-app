import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { logoutUser } from "../api/auth.api";

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const submitHandler = () => {
    try {
      logoutUser();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <nav className="bg-amber-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-white tracking-wide">
            Connectly<span className="ml-1">🤝</span>
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                type="submit"
                onClick={() => submitHandler()}
                className="px-4 py-2 rounded-md bg-amber-400 text-amber-900 font-semibold
                         hover:bg-amber-300 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-md bg-amber-400 text-amber-900 font-semibold
                         hover:bg-amber-300 transition"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
