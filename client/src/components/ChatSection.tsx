import { useEffect, useRef, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { deleteMsgForUser, getMessages } from "../api/messages.api";
import { getConversationId } from "../api/conversation.api";
import Message from "./Message";
import { uploadMsgFileToCloudinary } from "../utils/cloudinary";
import { socket } from "../socket";
import ChatSectionSettings from "./ChatSectionSettings";

/* ================= TYPES ================= */
interface User {
  id: string;
  username: string;
  email: string;
  profilePic: string;
}

interface Msg {
  seenAt: Date | null;
  id: string;
  senderId: string;
  conversationId: string;
  type: "text" | "image" | "video";
  content?: string;
  mediaUrl?: string;
  deletedFor: string[];
  deletedForAll: boolean;
  createdAt: string;
}

/* ================= COMPONENT ================= */

const ChatSection = ({ selectedUser }: { selectedUser: User | null }) => {
  const { user } = useAuth();
  if (!user) return null;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);

  /* media preview */
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  /* scroll to bottom */
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const prevConversationRef = useRef<string | null>(null);

  /* ================= MESSAGE HANDLERS ================= */
  // Select Messages for deletion
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const visibleMessages = messages.filter(
    (msg) => !msg.deletedFor?.includes(user?.id) && !msg.deletedForAll
  );

  const toggleSelectionMode = () => setSelectionMode(!selectionMode);
  const toggleMessageSelection = (messageId: string) => {
    if (!selectionMode) return;
    setSelectedMessages((prev) => {
      const next = new Set(prev);
      next.has(messageId) ? next.delete(messageId) : next.add(messageId);
      return next;
    });
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.size === 0) return;
    try {
      setIsDeleting(true);
      for (const messageId of selectedMessages) {
        await deleteMsgForUser({ messageId, userId: user.id });
      }
      setMessages((prev) =>
        prev.filter((msg) => !selectedMessages.has(msg.id))
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
      setSelectedMessages(new Set());
    }
  };

  /* ================= MESSAGE INPUT ================= */

  /* ================= SOCKET LISTENER ================= */

  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (msg: Msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("message:new", onNewMessage);
    return () => {
      socket.off("message:new", onNewMessage);
    };
  }, []);

  /* ================= LOAD MESSAGES ================= */

  const loadMessages = async () => {
    if (!user || !selectedUser) return;

    const res = await getMessages({
      currentUserId: user.id,
      otherUserId: selectedUser.id,
    });

    setMessages(res.data || []);
  };

  /* ================= INIT CONVERSATION ================= */

  useEffect(() => {
    if (!user || !selectedUser || !socket) return;

    let active = true;

    const init = async () => {
      const res = await getConversationId({
        currentUserId: user.id,
        otherUserId: selectedUser.id,
      });

      if (!active) return;

      const convId = res.data;
      setConversationId(convId);

      if (prevConversationRef.current) {
        socket.emit("leave:conversation", prevConversationRef.current);
      }

      socket.emit("join:conversation", convId);
      prevConversationRef.current = convId;

      await loadMessages();
    };

    init();

    return () => {
      active = false;
      if (prevConversationRef.current) {
        socket.emit("leave:conversation", prevConversationRef.current);
      }
      setMessages([]);
      setConversationId(null);
    };
  }, [selectedUser, user]);

  /* ================= SEND TEXT ================= */

  const sendText = () => {
    if (!text.trim() || !conversationId || !user || !selectedUser || !socket)
      return;

    socket.emit("message:send", {
      senderId: user.id,
      receiverId: selectedUser.id,
      conversationId,
      type: "text",
      content: text,
    });

    setText("");
  };

  /* ================= FILE SELECT ================= */

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Only images and videos allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Max size is 10MB");
      return;
    }

    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* ================= SEND MEDIA WITH FAKE PROGRESS ================= */

  const sendMedia = async () => {
    if (!previewFile || !user || !selectedUser || !conversationId || !socket)
      return;

    try {
      setUploadProgress(5); // start the progress bar

      // Simulate progress while backend uploads
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev; // stop at 90% until upload finishes
          return prev + 5;
        });
      }, 200);

      const res = await uploadMsgFileToCloudinary(previewFile);

      clearInterval(progressInterval);
      setUploadProgress(100); // finish progress

      socket.emit("message:send", {
        senderId: user.id,
        receiverId: selectedUser.id,
        conversationId,
        type: res.resource_type, // image | video
        mediaUrl: res.secure_url,
      });

      // reset after a short delay
      setTimeout(() => {
        setPreviewFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
      setUploadProgress(0);
    }
  };

  /* ================= AUTOSCROLL ================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  /* ================= MESSAGES SEEN ================= */
  useEffect(() => {
    if (!conversationId) return;

    socket.emit("join:conversation", conversationId);
    socket.emit("conversation:opened", { conversationId });

    return () => {
      socket.emit("leave:conversation", conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    const handleMessagesSeen = ({
      conversationId,
      seenAt,
    }: {
      conversationId: string;
      seenAt: Date;
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversationId === conversationId &&
          msg.senderId === user.id &&
          !msg.seenAt
            ? { ...msg, seenAt }
            : msg
        )
      );
    };

    socket.on("messages:seen", handleMessagesSeen);

    return () => {
      socket.off("messages:seen", handleMessagesSeen);
    };
  }, []);

  useEffect(() => {
    const handleMessageSeen = ({
      conversationId,
      messageId,
      seenAt,
    }: {
      conversationId: string;
      messageId: string;
      seenAt: Date;
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversationId === conversationId && msg.id === messageId
            ? { ...msg, seenAt }
            : msg
        )
      );
    };

    socket.on("message:seen", handleMessageSeen);

    return () => {
      socket.off("message:seen", handleMessageSeen);
    };
  }, []);

  /* ================= UI ================= */

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-gray-400">
        Start a conversation 🚀
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex justify-between">
        <div>
          <h1 className="font-semibold">{selectedUser.username}</h1>
          <p className="text-xs text-gray-400">{selectedUser.email}</p>
        </div>

        <div className="flex">
          <button
            className={`text-white ${
              selectionMode ? "bg-red-500" : "bg-gray-500"
            }`}
            onClick={toggleSelectionMode}
          >
            MODE
          </button>
          <ChatSectionSettings />

          {selectionMode && selectedMessages.size > 0 && (
            <button
              disabled={isDeleting}
              type="button"
              onClick={() => deleteSelectedMessages()}
              className="text-red-500"
            >
              DELETE
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {visibleMessages.map((msg) => {
          const isSelected = selectedMessages.has(msg.id);

          return (
            <div
              onClick={() => toggleMessageSelection(msg.id)}
              key={msg.id}
              className={`flex ${
                msg.senderId === user?.id ? "justify-end" : "justify-start"
              } ${isSelected ? "bg-slate-800 cursor-pointer" : ""}
              }`}
            >
              <Message msg={msg} isMe={msg.senderId === user?.id} />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Preview & Progress */}
      {previewUrl && (
        <div className="px-4 py-3 border-t border-slate-800">
          {previewFile?.type.startsWith("image") && (
            <img src={previewUrl} className="max-w-xs rounded-lg mb-2" />
          )}

          {previewFile?.type.startsWith("video") && (
            <video
              src={previewUrl}
              controls
              className="max-w-xs rounded-lg mb-2"
            />
          )}

          {/* Progress bar */}
          {uploadProgress > 0 && (
            <div className="h-1 bg-slate-700 rounded mb-2">
              <div
                className="h-1 bg-indigo-500 rounded"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button
              onClick={sendMedia}
              className="bg-indigo-600 px-4 py-1 rounded"
            >
              Send
            </button>
            <button
              onClick={() => {
                setPreviewFile(null);
                setPreviewUrl(null);
                setUploadProgress(0);
              }}
              className="bg-slate-700 px-4 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <input
            id="file"
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileSelect}
          />

          <label
            htmlFor="file"
            className="px-3 py-2 rounded-full bg-slate-800 cursor-pointer hover:bg-slate-700"
          >
            📎
          </label>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendText()}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 px-4 py-2 rounded-full outline-none"
          />

          <button
            onClick={sendText}
            className="bg-indigo-600 px-5 py-2 rounded-full"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
