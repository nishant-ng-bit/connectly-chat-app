import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { getMessages, sendMessage } from "../api/messages.api";

interface User {
  id: string;
  username: string;
  email: string;
}

interface Msg {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
}
const ChatSection = ({ selectedUser }: { selectedUser: User | null }) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([] as Msg[]);
  const [userMsg, setUserMsg] = useState("");

  const getmsg = async () => {
    try {
      if (!selectedUser || !user) return;
      const res = await getMessages({
        currentUserId: user.id,
        otherUserId: selectedUser.id,
      });

      setMessages(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessageSubmit = async () => {
    try {
      if (!selectedUser || !user || userMsg.trim() === "") return;
      await sendMessage({
        senderId: user.id,
        receiverId: selectedUser.id,
        content: userMsg,
      });

      setUserMsg("");
      getmsg();
    } catch (error) {
      console.log("unable to send message");
    }
  };

  useEffect(() => {
    getmsg();
  }, [selectedUser]);

  return (
    <div className="bg-green-800 h-full p-4 text-white">
      {selectedUser ? (
        <div className="flex flex-col justify-between h-full">
          <h1 className="text-xl font-semibold">
            Chat with {selectedUser.username}
            {messages.map((msg) => (
              <p key={msg.id}>{msg.content}</p>
            ))}
          </h1>
          <div className=" text-white ">
            <input
              type="text"
              placeholder="Type a message..."
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessageSubmit();
                }
              }}
              className="bg-violet-400 w-full outline-none p-2 rounded-4xl"
            ></input>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <h1 className="text-lg">Start a conversation…</h1>
        </div>
      )}
    </div>
  );
};

export default ChatSection;
