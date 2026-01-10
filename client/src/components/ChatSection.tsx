import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { deleteMsgForUser, getMessages } from "../api/messages.api";
import { clearConversation, getConversationId } from "../api/conversation.api";
import Message from "./Message";
import { uploadMsgFileToCloudinary } from "../utils/cloudinary";
import { socket } from "../socket";
import ChatSectionSettings from "./ChatSectionSettings";
import { CgSoftwareUpload } from "react-icons/cg";
import { MdDeleteOutline } from "react-icons/md";
import { toast } from "react-toastify";
import Avatar from "./Avatar";
import { Link } from "react-router-dom";

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

const ChatSection = ({
  selectedUser,
  typingMap,
  setTypingMap,
}: {
  selectedUser: User | null;
  typingMap: Record<string, Set<string>>;
  setTypingMap: React.Dispatch<
    React.SetStateAction<Record<string, Set<string>>>
  >;
}) => {
  const { user } = useAuth();
  if (!user) return null;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const prevConversationRef = useRef<string | null>(null);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const visibleMessages = messages.filter(
    (msg) => !msg.deletedFor?.includes(user?.id) && !msg.deletedForAll
  );

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
  };
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
      toggleSelectionMode();
    }
  };

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

  const loadMessages = async () => {
    if (!user || !selectedUser) return;

    const res = await getMessages({
      currentUserId: user.id,
      otherUserId: selectedUser.id,
    });

    setMessages(res.data || []);
  };

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

  const sendText = () => {
    if (!text.trim() || !user || !selectedUser || !socket) return;

    socket.emit("message:send", {
      senderId: user.id,
      receiverId: selectedUser.id,
      conversationId,
      type: "text",
      content: text,
    });

    setText("");
  };

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

  const sendMedia = async () => {
    if (!previewFile || !user || !selectedUser || !socket) return;

    try {
      setUploadProgress(5);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 200);

      const res = await uploadMsgFileToCloudinary(previewFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      socket.emit("message:send", {
        senderId: user.id,
        receiverId: selectedUser.id,
        conversationId,
        type: res.resource_type,
        mediaUrl: res.secure_url,
      });

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

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

  const typingTimeoutRef = useRef<any | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = () => {
    if (!socket || !selectedUser) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;

      socket.emit("typing:start", {
        receiverId: selectedUser.id,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;

      socket.emit("typing:stop", {
        receiverId: selectedUser.id,
      });
    }, 1000);
  };

  useEffect(() => {
    if (!socket) return;

    const handleTypingStart = ({ userId }: { userId: string }) => {
      setTypingMap((prev) => {
        const next = { ...prev };
        if (!next[userId]) {
          next[userId] = new Set();
        }
        next[userId].add(userId);
        return next;
      });
    };

    const handleTypingStop = ({ userId }: { userId: string }) => {
      setTypingMap((prev) => {
        const next = { ...prev };
        next[userId]?.delete(userId);
        if (next[userId]?.size === 0) {
          delete next[userId];
        }
        return next;
      });
    };

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, []);

  const isOtherUserTyping =
    selectedUser && typingMap[selectedUser.id]?.has(selectedUser.id);

  const handleClearConversation = async (): Promise<void> => {
    try {
      if (!conversationId) return;

      await clearConversation(conversationId);
      setMessages([]);

      toast.success("Conversation cleared successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear conversation");
    } finally {
      setIsDeleting(false);
      setSelectionMode(false);
      setSelectedMessages(new Set());
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-gray-400">
        Start a conversation 🚀
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white text-black dark:bg-slate-950 dark:text-gray-100 ">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between">
        <div className="flex items-center gap-2">
          <Link to={`/user/${selectedUser.id}`}>
            <Avatar
              size="sm"
              username={selectedUser.username}
              src={selectedUser.profilePic}
            />
          </Link>

          <div>
            <h1 className="font-semibold">{selectedUser.username}</h1>
            <p className="text-xs text-gray-400">{selectedUser.email}</p>
            {isOtherUserTyping && (
              <p className="text-xs text-indigo-500">typing…</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center justify-center">
          {selectionMode && selectedMessages.size > 0 && (
            <button
              disabled={isDeleting}
              type="button"
              onClick={() => {
                deleteSelectedMessages();
              }}
              className="text-red-500 text-2xl"
            >
              {isDeleting ? (
                <div className="text-xl">"Deleting..."</div>
              ) : (
                <MdDeleteOutline />
              )}
            </button>
          )}

          <ChatSectionSettings
            toggleSelectionMode={toggleSelectionMode}
            handleClearConversation={handleClearConversation}
            isDeleting={isDeleting}
            setIsDeleting={setIsDeleting}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {visibleMessages.map((msg) => {
          const isSelected = selectedMessages.has(msg.id);

          return (
            <div
              onClick={() => toggleMessageSelection(msg.id)}
              key={msg.id}
              className={`flex gap-2 ${
                msg.senderId === user?.id ? "justify-end" : "justify-start"
              } ${
                isSelected
                  ? "dark:bg-slate-800 bg-slate-400 rounded-md cursor-pointer"
                  : ""
              }
              }`}
            >
              {selectionMode && <input checked={isSelected} type="checkbox" />}
              <Message msg={msg} isMe={msg.senderId === user?.id} />
            </div>
          );
        })}
        <div className="" ref={bottomRef} />
      </div>

      {previewUrl && (
        <div className="px-4 py-3 border-t text-white dark:border-slate-800 border-slate-200">
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

          {uploadProgress > 0 && (
            <div className="h-1 bg-slate-700 rounded mb-2">
              <div
                className="h-1 bg-indigo-500 rounded"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {uploadProgress === 0 && (
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
          )}
        </div>
      )}

      <div className="px-4 py-3 border-t dark:border-slate-800 border-slate-200 ">
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
            className="px-3 py-2 text-xl rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 cursor-pointer dark:hover:bg-slate-700 text-black dark:text-white transition-colors"
          >
            <CgSoftwareUpload />
          </label>

          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && sendText()}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 text-black dark:text-slate-300 dark:bg-slate-800 px-4 py-2 rounded-full outline-none transition-colors"
          />

          <button
            type="button"
            onClick={sendText}
            className="dark:bg-indigo-600 bg-slate-200 text-black dark:text-white px-5 py-2 rounded-full transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
