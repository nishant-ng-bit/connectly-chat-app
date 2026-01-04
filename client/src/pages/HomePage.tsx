import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-amber-50">
      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-amber-900">
          Welcome to <span className="text-amber-700">Connectly 🤝</span>
        </h1>

        <p className="mt-4 max-w-xl text-amber-800 text-lg">
          Connect instantly. Chat securely. Simple, fast, and built for real
          conversations.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/chats"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition"
          >
            Open Chats
          </Link>

          <Link
            to="/profile"
            className="border border-amber-600 text-amber-700 px-6 py-3 rounded-lg font-semibold hover:bg-amber-100 transition"
          >
            View Profile
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-amber-900 text-lg">⚡ Fast</h3>
          <p className="text-amber-700 mt-2">
            Real-time messaging with smooth performance.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-amber-900 text-lg">🔐 Secure</h3>
          <p className="text-amber-700 mt-2">
            JWT + HTTP-only cookies for secure authentication.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-amber-900 text-lg">🤝 Simple</h3>
          <p className="text-amber-700 mt-2">
            Clean UI focused on conversations, not clutter.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
