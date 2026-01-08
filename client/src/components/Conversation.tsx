import { usePresence } from "../providers/PresenceProvider";
import Avatar from "./Avatar";

interface User {
  id: string;
  username: string;
  email: string;
  profilePic: string;
  status: string;
  lastSeen: string;
}

interface ConversationProps {
  user: User;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  isActive?: boolean;
  typing?: boolean;
}

export const Conversation = ({
  user,
  setSelectedUser,
  isActive = false,
  typing = false,
}: ConversationProps) => {
  const { onlineUsers } = usePresence();

  return (
    <button
      onClick={() => setSelectedUser(user)}
      className={`
        group w-full flex items-center gap-3 px-4 py-3
        text-left 
        border-l-4
        ${
          isActive
            ? "bg-slate-100 dark:bg-slate-800 border-indigo-500"
            : "bg-white  dark:bg-slate-900 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
        }
      `}
    >
      <Avatar src={user.profilePic} username={user.username} />

      <span
        className={`
          h-2 w-2 rounded-full shrink-0
          ${
            onlineUsers[user.id]
              ? "bg-green-500"
              : "bg-gray-300 dark:bg-gray-600"
          }
        `}
      />

      <div className="flex-1 min-w-0">
        <p
          className="
            text-sm font-medium truncate
            text-slate-900 dark:text-gray-100
          "
        >
          {user.username}
        </p>

        {typing ? (
          <p className="text-xs text-indigo-500 italic truncate">typing…</p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        )}
      </div>
    </button>
  );
};
