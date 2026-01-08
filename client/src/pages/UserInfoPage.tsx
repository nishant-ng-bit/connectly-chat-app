import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import { getUserById } from "../api/user.api";

type User = {
  id: string;
  username: string;
  email: string;
  profilePic?: string | null;
  status: string;
  lastSeen: string;
  createdAt: string;
};

const UserInfoPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserDetails = async () => {
    try {
      const res = await getUserById(id!);
      setUser(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getUserDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-gray-400">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-gray-400">
        User not found
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-4
        bg-slate-100 dark:bg-slate-950
        transition-colors
      "
    >
      <div
        className="
          w-full max-w-md
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-800
          rounded-2xl shadow-xl
          p-8
        "
      >
        <div className="flex flex-col items-center">
          <Avatar src={user.profilePic} username={user.username} size="lg" />

          <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-gray-100">
            {user.username}
          </h2>

          <p className="text-sm text-slate-600 dark:text-gray-400">
            {user.email}
          </p>
        </div>

        <div
          className="
            mt-6 p-4 rounded-xl
            bg-slate-100 dark:bg-slate-800
            text-center text-sm
            text-slate-700 dark:text-gray-300
          "
        >
          {user.status || "Hey there! I’m using Connectly 👋"}
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              User ID
            </p>
            <p className="text-slate-700 dark:text-gray-200 break-all">
              {user.id}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Joined
            </p>
            <p className="text-slate-700 dark:text-gray-200">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;
