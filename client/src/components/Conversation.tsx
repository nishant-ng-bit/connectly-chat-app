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
}

export const Conversation = ({
  user,
  setSelectedUser,
  isActive = false,
}: ConversationProps) => {
  const { onlineUsers } = usePresence();

  return (
    <button
      onClick={() => setSelectedUser(user)}
      className={`
        group w-full flex items-center gap-3 px-4 py-3
        text-left transition-all duration-200
        border-l-4
        ${
          isActive
            ? "bg-slate-800 border-indigo-500"
            : "bg-slate-900 border-transparent hover:bg-slate-800"
        }
      `}
    >
      {/* Avatar */}
      {user.profilePic ? (
        <img
          src={user.profilePic}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <Avatar username={user.username} />
      )}
      {/* Online dot */}
      <div
        className={`
          h-2 w-2 rounded-full
          ${
            onlineUsers[user.id]
              ? "bg-indigo-500"
              : "bg-transparent group-hover:bg-gray-600"
          }
        `}
      />
      {/* User info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100 truncate">
          {user.username}
        </p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>
    </button>
  );
};
