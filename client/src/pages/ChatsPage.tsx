import { useEffect, useState } from "react";
import { getConversations } from "../api/conversation.api";
import Conversation from "../components/Conversation";
import ChatSection from "../components/ChatSection";

interface User {
  id: string;
  username: string;
  email: string;
}

interface ConversationItem {
  user: User;
}

const ChatsPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await getConversations();
        setConversations(res.data);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="flex h-full">
      <ul className="w-[25%] h-full overflow-y-auto bg-gray-900 ">
        {conversations.map((item) => (
          <Conversation
            key={item.user.id}
            user={item.user}
            setSelectedUser={setSelectedUser}
          />
        ))}
      </ul>

      <div className="flex-1 h-full min-h-0">
        <ChatSection selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default ChatsPage;
