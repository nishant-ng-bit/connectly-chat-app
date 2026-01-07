export const onlineUsers = new Map<string, Set<string>>();

export const addOnlineUser = (userId: string, socketId: string) => {
  if (onlineUsers.has(userId)) {
    onlineUsers.get(userId)?.add(socketId);
  } else {
    onlineUsers.set(userId, new Set([socketId]));
  }
};

export const removeOnlineUser = (userId: string, socketId: string) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(userId);
  }
};

export const isUserOnline = (userId: string) => onlineUsers.has(userId);
