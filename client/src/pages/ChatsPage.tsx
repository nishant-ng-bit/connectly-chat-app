import { useEffect, useState } from "react";
import { getConversations } from "../api/conversation.api";
import { Conversation } from "../components/Conversation";
import ChatSection from "../components/ChatSection";
import SearchBox from "../components/SearchBox";
import { getUserByQuery } from "../api/user.api";
import { socket } from "../socket";

interface User {
  id: string;
  username: string;
  email: string;
  profilePic: string;
  status: string;
  lastSeen: string;
}

interface ConversationItem {
  conversationId: string;
  user: User;
}

const ChatsPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const [typingMap, setTypingMap] = useState<Record<string, Set<string>>>({});

  const handleSearch = async () => {
    try {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      const res = await getUserByQuery(searchQuery);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Error searching for users:", error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const refresh = () => {
      fetchConversations();
    };

    socket.on("conversation:updated", refresh);
    return () => {
      socket.off("conversation:updated", refresh);
    };
  }, []);

  return (
    <div className="flex h-full dark:bg-slate-950 bg-white overflow-auto">
      <div
        className={`sm:w-[320px] w-full flex-col border-r dark:border-slate-800 border-slate-200 ${
          selectedUser ? "hidden sm:flex" : ""
        }`}
      >
        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {searchQuery ? (
            searchResults.length > 0 ? (
              searchResults.map((user) => (
                <Conversation
                  key={user.id}
                  user={user}
                  setSelectedUser={setSelectedUser}
                  isActive={selectedUser?.id === user.id}
                />
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                No users found
              </p>
            )
          ) : conversations.length > 0 ? (
            conversations.map((item) => (
              <Conversation
                key={item.user.id}
                user={item.user}
                setSelectedUser={setSelectedUser}
                isActive={selectedUser?.id === item.user.id}
                typing={!!typingMap[item.conversationId]?.size}
              />
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">
              No conversations yet
            </p>
          )}
        </div>
      </div>

      <main
        className={`flex-1 min-w-0
        ${selectedUser ? "" : "hidden sm:flex"}`}
      >
        <ChatSection
          selectedUser={selectedUser}
          typingMap={typingMap}
          setTypingMap={setTypingMap}
        />
      </main>
    </div>
  );
};

export default ChatsPage;
