import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 overflow-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600/20 via-purple-600/10 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Welcome to{" "}
            <span className="bg-linear-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Connectly
            </span>{" "}
            🤝
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400">
            Connect instantly. Chat securely. Simple, fast, and built for real
            conversations.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/chats"
              className="
                px-6 py-3 rounded-xl
                bg-indigo-600 hover:bg-indigo-700
                text-white font-medium
                transition
              "
            >
              Open Chats
            </Link>

            <Link
              to="/profile"
              className="
                px-6 py-3 rounded-xl
                bg-slate-800 hover:bg-slate-700
                text-gray-200 font-medium
                border border-slate-700
                transition
              "
            >
              View Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="font-semibold text-lg text-indigo-400">⚡ Fast</h3>
          <p className="text-gray-400 mt-2">
            Real-time messaging with smooth performance and low latency.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="font-semibold text-lg text-indigo-400">🔐 Secure</h3>
          <p className="text-gray-400 mt-2">
            JWT & HTTP-only cookies ensure strong authentication security.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="font-semibold text-lg text-indigo-400">🤝 Simple</h3>
          <p className="text-gray-400 mt-2">
            Clean, minimal UI focused entirely on conversations.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
