import Avatar from "./Avatar";
import { usePresence } from "../providers/PresenceProvider";

export interface User {
  id: string;
  username: string;
  email: string;
  profilePic: string;
  status?: string;
  lastSeen?: string;
}

export interface ChatTarget {
  conversationId?: string;
  isGroup?: boolean;
  name?: string;
  image?: string | null;
  user?: User;
  participants?: { role: string; user: User }[];
}

interface ConversationProps {
  target: ChatTarget;
  setSelectedTarget: React.Dispatch<React.SetStateAction<ChatTarget | null>>;
  isActive?: boolean;
  typing?: boolean;
}

export const Conversation = ({
  target,
  setSelectedTarget,
  isActive = false,
  typing = false,
}: ConversationProps) => {
  const { onlineUsers } = usePresence();
  const user = target.user;
  const title = target.isGroup ? target.name || "Untitled group" : user?.username || "Unknown user";
  const subtitle = target.isGroup
    ? `${target.participants?.length || 0} members`
    : user?.status || user?.email || "";
  const isAI = user?.id === "000000000000000000000000";
  const isOnline = !!target.isGroup || isAI || !!(user && onlineUsers[user.id]);

  return (
    <button
      onClick={() => setSelectedTarget(target)}
      className={`
        group w-[calc(100%-1rem)] mx-2 my-1.5 flex items-center gap-3.5 px-3.5 py-3.5
        text-left rounded-2xl
        transition-all duration-200 border
        ${
          isActive
            ? "bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-500/50 shadow-lg shadow-indigo-500/10 scale-[1.01]"
            : "bg-white/55 dark:bg-slate-950/35 border-transparent hover:bg-white/90 dark:hover:bg-slate-900/80 hover:border-slate-200 dark:hover:border-slate-800 hover:shadow-md"
        }
      `}
    >
      <div className="relative shrink-0">
        <Avatar src={target.isGroup ? target.image || undefined : user?.profilePic} username={title} size="sm" />
        <span
          className={`
            absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-950 shadow-sm
            ${isOnline ? "bg-emerald-400" : "bg-slate-300 dark:bg-slate-700"}
            ${isAI ? "animate-pulse" : ""}
          `}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <p
            className={`
              text-sm font-extrabold truncate tracking-tight
              ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-slate-200"}
              group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200
            `}
          >
            {title}
          </p>
          {target.isGroup && (
            <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-extrabold tracking-wide">
              GROUP
            </span>
          )}
          {isAI && (
            <span className="text-[9px] bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-extrabold tracking-wide">
              BOT
            </span>
          )}
        </div>

        {typing ? (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium italic truncate mt-0.5 animate-pulse">typing...</p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 font-medium">
            {isAI ? "Always here to help you!" : subtitle}
          </p>
        )}
      </div>
    </button>
  );
};
