import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { socket } from "../socket";

type PresenceContextType = {
  onlineUsers: Record<string, boolean>;
};

const PresenceContext = createContext<PresenceContextType | null>(null);

const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;

    socket.auth = { userId: user.id };
    socket.connect();

    const handlePresenceUpdate = ({
      userId,
      online,
    }: {
      userId: string;
      online: boolean;
    }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: online,
      }));
    };

    socket.on("presence:sync", (userIds: string[]) => {
      const map: Record<string, boolean> = {};
      userIds.forEach((id) => (map[id] = true));
      setOnlineUsers(map);
    });

    socket.on("presence:update", ({ userId, online }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: online,
      }));
    });

    return () => {
      socket.off("presence:update", handlePresenceUpdate);
      socket.disconnect();
    };
  }, [user?.id]);

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
};

export default PresenceProvider;

export const usePresence = () => {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error("usePresence must be used within PresenceProvider");
  }
  return ctx;
};
