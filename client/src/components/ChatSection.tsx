import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { deleteMsgForUser, getMessages, refineMessageText } from "../api/messages.api";
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
import type { ChatTarget } from "./Conversation";

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
  reactions?: Record<string, string[]>;
}

interface ChatTheme {
  id: string;
  name: string;
  background: string;
  bubbleMe: string;
  bubbleOther: string;
  sendButton: string;
}

const AI_ID = "000000000000000000000000";
const COMPOSER_EMOJIS = ["😀", "😂", "😍", "🥳", "😎", "😭", "👍", "❤️", "🔥", "🙏", "✨", "🎉", "🤝", "💬", "✅", "🚀"];

const refineTextLocally = (value: string) => {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const withCapital = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return withCapital
    .replace(/\bi\b/g, "I")
    .replace(/\bu\b/gi, "you")
    .replace(/\bur\b/gi, "your")
    .replace(/\bdont\b/gi, "don't")
    .replace(/\bcant\b/gi, "can't")
    .replace(/\bim\b/gi, "I'm")
    .replace(/[.!?]?$/, (match) => match || ".");
};

const CHAT_THEMES: ChatTheme[] = [
  {
    id: "lake",
    name: "Mountain Lake",
    background: "theme-wallpaper-lake",
    bubbleMe: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950",
    bubbleOther: "bg-white/92 dark:bg-slate-950/82 backdrop-blur-md border border-white/75 dark:border-slate-700/70 text-slate-900 dark:text-slate-100",
    sendButton: "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 shadow-lg shadow-slate-900/10",
  },
  {
    id: "leaves",
    name: "Green Leaves",
    background: "theme-wallpaper-leaves",
    bubbleMe: "bg-teal-800 text-white dark:bg-teal-100 dark:text-teal-950",
    bubbleOther: "bg-white/92 dark:bg-slate-950/82 backdrop-blur-md border border-emerald-100/80 dark:border-teal-800/50 text-slate-900 dark:text-teal-50",
    sendButton: "bg-teal-800 hover:bg-teal-700 dark:bg-teal-100 dark:hover:bg-white text-white dark:text-teal-950 shadow-lg shadow-teal-900/10",
  },
  {
    id: "forest",
    name: "Forest Mist",
    background: "theme-wallpaper-forest",
    bubbleMe: "bg-emerald-800 text-white dark:bg-emerald-100 dark:text-emerald-950",
    bubbleOther: "bg-white/92 dark:bg-slate-950/82 backdrop-blur-md border border-emerald-100/80 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-50",
    sendButton: "bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-100 dark:hover:bg-white text-white dark:text-emerald-950 shadow-lg shadow-emerald-900/10",
  },
];

const ChatSection = ({
  selectedTarget,
  typingMap,
  setTypingMap,
  onConversationChanged,
}: {
  selectedTarget: ChatTarget | null;
  typingMap: Record<string, Set<string>>;
  setTypingMap: React.Dispatch<React.SetStateAction<Record<string, Set<string>>>>;
  onConversationChanged?: () => void;
}) => {
  const { user } = useAuth();
  if (!user) return null;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [deletingMsgIds, setDeletingMsgIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [themeId, setThemeId] = useState("lake");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const prevConversationRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const selectedUser = selectedTarget?.user;
  const isGroup = !!selectedTarget?.isGroup;
  const targetTitle = isGroup ? selectedTarget?.name || "Untitled group" : selectedUser?.username || "";
  const targetSubtitle = isGroup
    ? `${selectedTarget?.participants?.length || 0} members`
    : selectedUser?.id === AI_ID
      ? "Always Online"
      : selectedUser?.email || "";
  const targetAvatar = isGroup ? selectedTarget?.image || undefined : selectedUser?.profilePic;
  const targetThemeKey = selectedTarget?.conversationId || selectedUser?.id || "default";
  const isAI = selectedUser?.id === AI_ID;
  const activeTheme = CHAT_THEMES.find((theme) => theme.id === themeId) || CHAT_THEMES[0];

  const visibleMessages = messages.filter(
    (msg) => !msg.deletedFor?.includes(user.id) && !msg.deletedForAll
  );

  useEffect(() => {
    if (!selectedTarget) return;
    const defaultTheme = isAI ? "leaves" : "lake";
    const storedTheme = localStorage.getItem(`chat-theme-${targetThemeKey}`);
    const migratedTheme =
      storedTheme === "classic" || storedTheme === "sunset"
        ? "lake"
        : storedTheme === "midnight"
          ? "leaves"
          : storedTheme === "sage" || storedTheme === "stealth"
            ? "forest"
            : storedTheme;
    setThemeId(CHAT_THEMES.some((theme) => theme.id === migratedTheme) ? migratedTheme || defaultTheme : defaultTheme);
    setShowThemePicker(false);
    setShowEmojiPicker(false);
  }, [selectedTarget, targetThemeKey, isAI]);

  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (msg: Msg) => {
      setMessages((prev) => {
        if (conversationId && msg.conversationId !== conversationId) return prev;
        if (prev.some((item) => item.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (!conversationId) setConversationId(msg.conversationId);
    };
    const onReaction = (msg: Msg) => {
      setMessages((prev) => prev.map((item) => (item.id === msg.id ? msg : item)));
    };
    const onError = ({ message }: { message: string }) => toast.error(message);

    socket.on("message:new", onNewMessage);
    socket.on("message:reaction", onReaction);
    socket.on("message:error", onError);
    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message:reaction", onReaction);
      socket.off("message:error", onError);
    };
  }, [conversationId]);

  const loadMessages = async (targetConversationId?: string | null) => {
    if (!selectedTarget) return;
    const res = await getMessages({
      currentUserId: user.id,
      otherUserId: selectedTarget.isGroup ? undefined : selectedTarget.user?.id,
      conversationId: selectedTarget.isGroup ? targetConversationId || selectedTarget.conversationId : undefined,
    });
    setMessages(res.data || []);
  };

  useEffect(() => {
    if (!selectedTarget || !socket) return;
    let active = true;

    const init = async () => {
      let convId = selectedTarget.conversationId || null;
      if (!convId && selectedTarget.user?.id) {
        const res = await getConversationId({ currentUserId: user.id, otherUserId: selectedTarget.user.id });
        convId = res.data || null;
      }
      if (!active) return;

      if (prevConversationRef.current) socket.emit("leave:conversation", prevConversationRef.current);
      setConversationId(convId);
      if (convId) {
        socket.emit("join:conversation", convId);
        socket.emit("conversation:opened", { conversationId: convId });
        prevConversationRef.current = convId;
      }
      await loadMessages(convId);
    };

    init();

    return () => {
      active = false;
      if (prevConversationRef.current) socket.emit("leave:conversation", prevConversationRef.current);
      prevConversationRef.current = null;
      setMessages([]);
      setConversationId(null);
      setText("");
      setSelectionMode(false);
      setSelectedMessages(new Set());
    };
  }, [selectedTarget, user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handleMessagesSeen = ({ conversationId, seenAt }: { conversationId: string; seenAt: Date }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversationId === conversationId && msg.senderId === user.id && !msg.seenAt
            ? { ...msg, seenAt }
            : msg
        )
      );
    };
    const handleMessageSeen = ({ conversationId, messageId, seenAt }: { conversationId: string; messageId: string; seenAt: Date }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.conversationId === conversationId && msg.id === messageId ? { ...msg, seenAt } : msg))
      );
    };
    socket.on("messages:seen", handleMessagesSeen);
    socket.on("message:seen", handleMessageSeen);
    return () => {
      socket.off("messages:seen", handleMessagesSeen);
      socket.off("message:seen", handleMessageSeen);
    };
  }, [user.id]);

  useEffect(() => {
    if (!socket) return;
    const handleTypingStart = ({ userId, conversationId }: { userId: string; conversationId?: string }) => {
      const key = conversationId || userId;
      setTypingMap((prev) => {
        const next = { ...prev };
        next[key] = new Set(next[key] || []);
        next[key].add(userId);
        return next;
      });
    };
    const handleTypingStop = ({ userId, conversationId }: { userId: string; conversationId?: string }) => {
      const key = conversationId || userId;
      setTypingMap((prev) => {
        const next = { ...prev };
        next[key]?.delete(userId);
        if (next[key]?.size === 0) delete next[key];
        return next;
      });
    };
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    return () => {
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [setTypingMap]);

  const typingKey = isGroup ? conversationId || selectedTarget?.conversationId : selectedUser?.id;
  const isOtherUserTyping = !!typingKey && !!typingMap[typingKey]?.size;

  const emitTyping = () => {
    if (!socket || !selectedTarget) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      if (isGroup && conversationId) socket.emit("typing:start", { conversationId });
      else if (selectedUser?.id) socket.emit("typing:start", { receiverId: selectedUser.id });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      if (isGroup && conversationId) socket.emit("typing:stop", { conversationId });
      else if (selectedUser?.id) socket.emit("typing:stop", { receiverId: selectedUser.id });
    }, 1000);
  };

  const handleRefineText = async () => {
    if (!text.trim() || isRefining) return;
    try {
      setIsRefining(true);
      const res = await refineMessageText(text);
      if (res.data?.text) setText(res.data.text);
    } catch {
      setText(refineTextLocally(text));
    } finally {
      setIsRefining(false);
    }
  };

  const sendText = () => {
    if (!text.trim() || !selectedTarget || !socket) return;
    socket.emit("message:send", {
      senderId: user.id,
      receiverId: selectedTarget.isGroup ? undefined : selectedTarget.user?.id,
      conversationId: selectedTarget.isGroup ? conversationId || selectedTarget.conversationId : conversationId,
      type: "text",
      content: text,
    });
    setText("");
    setShowEmojiPicker(false);
    onConversationChanged?.();
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (!socket) return;
    socket.emit("message:react", { messageId, emoji, userId: user.id });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Only images and videos allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max size is 10MB");
      return;
    }
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const sendMedia = async () => {
    if (!previewFile || !selectedTarget || !socket) return;
    try {
      setUploadProgress(5);
      const progressInterval = setInterval(() => setUploadProgress((prev) => (prev >= 90 ? prev : prev + 5)), 200);
      const res = await uploadMsgFileToCloudinary(previewFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      socket.emit("message:send", {
        senderId: user.id,
        receiverId: selectedTarget.isGroup ? undefined : selectedTarget.user?.id,
        conversationId: selectedTarget.isGroup ? conversationId || selectedTarget.conversationId : conversationId,
        type: res.resource_type,
        mediaUrl: res.secure_url,
        content: text.trim() || undefined,
      });
      setTimeout(() => {
        setPreviewFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        setText("");
        setShowEmojiPicker(false);
      }, 500);
      onConversationChanged?.();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setUploadProgress(0);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => !prev);
    setSelectedMessages(new Set());
    setDeletingMsgIds(new Set());
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
      setDeletingMsgIds(new Set(selectedMessages));
      await new Promise((resolve) => setTimeout(resolve, 300));
      for (const messageId of selectedMessages) await deleteMsgForUser({ messageId, userId: user.id });
      setMessages((prev) => prev.filter((msg) => !selectedMessages.has(msg.id)));
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete selected messages");
    } finally {
      setIsDeleting(false);
      setDeletingMsgIds(new Set());
      setSelectedMessages(new Set());
      setSelectionMode(false);
    }
  };

  const handleClearConversation = async () => {
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

  if (!selectedTarget) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 transition-colors">
        <span className="text-6xl mb-4">💬</span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">No chat selected</h2>
        <p className="text-sm mt-1 max-w-xs text-center leading-relaxed">
          Choose a conversation from the sidebar or search for users to start talking.
        </p>
      </div>
    );
  }

  return (
    <div className={`chat-shell chat-noise flex flex-col h-full ${activeTheme.background} transition-all duration-300 relative overflow-hidden`}>
      <div className="relative z-20 mx-3 mt-3 rounded-3xl border chat-glass px-4 sm:px-5 py-3.5 backdrop-blur-2xl flex justify-between items-center transition-colors">
        <div className="flex min-w-0 items-center gap-3">
          {isGroup ? (
            <div className="relative rounded-2xl ring-4 ring-white/50 dark:ring-slate-800/70 shadow-lg">
              <Avatar size="sm" username={targetTitle} src={targetAvatar} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-950 bg-emerald-500" />
            </div>
          ) : (
            <Link to={isAI ? "#" : `/user/${selectedUser?.id}`} className={isAI ? "pointer-events-none" : ""}>
              <div className="relative rounded-2xl ring-4 ring-white/50 dark:ring-slate-800/70 shadow-lg">
                <Avatar size="sm" username={targetTitle} src={targetAvatar} />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-950 ${isAI ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              </div>
            </Link>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-base sm:text-lg text-slate-950 dark:text-white flex items-center gap-2 tracking-tight">
                {targetTitle}
                {isGroup && <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">GROUP</span>}
                {isAI && <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">BOT</span>}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{targetSubtitle} · Wallpaper: {activeTheme.name}</p>
          </div>
        </div>

        <div className="flex gap-2.5 items-center relative">
          {selectionMode ? (
            <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 px-3 py-1.5 rounded-2xl animate-fade-in">
              <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">{selectedMessages.size} selected</span>
              <button type="button" onClick={toggleSelectionMode} className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer">Cancel</button>
              {selectedMessages.size > 0 && (
                <button disabled={isDeleting} type="button" onClick={deleteSelectedMessages} className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-rose-500/15 transition cursor-pointer disabled:opacity-50">
                  {isDeleting ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><MdDeleteOutline className="text-sm shrink-0" />Delete</>}
                </button>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => setShowThemePicker(!showThemePicker)} className="h-10 w-10 rounded-2xl bg-white/70 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800/70 text-lg transition-all cursor-pointer shadow-sm hover:-translate-y-0.5" title="Chat Wallpaper">🎨</button>
              {showThemePicker && (
                <div className="absolute right-12 top-12 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-3xl p-2.5 w-64 z-50 flex flex-col gap-1.5 transition-all">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-3 py-1.5 uppercase tracking-wider">Chat Wallpaper</p>
                  {CHAT_THEMES.map((theme) => (
                    <button key={theme.id} onClick={() => { setThemeId(theme.id); localStorage.setItem(`chat-theme-${targetThemeKey}`, theme.id); setShowThemePicker(false); }} className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold text-left transition-all ${themeId === theme.id ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-lg shadow-slate-900/10" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                      <span className="flex items-center gap-2">
                        <span className={`h-8 w-10 rounded-xl border border-white/70 dark:border-slate-700 shadow-inner bg-cover bg-center ${theme.id === "lake" ? "bg-[url('/chat-wallpapers/mountain-lake.png')]" : theme.id === "leaves" ? "bg-[url('/chat-wallpapers/green-leaves.png')]" : "bg-[url('/chat-wallpapers/forest-mist.png')]"}`} />
                        {theme.name}
                      </span>
                      {themeId === theme.id && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
              <ChatSectionSettings toggleSelectionMode={toggleSelectionMode} handleClearConversation={handleClearConversation} isDeleting={isDeleting} setIsDeleting={setIsDeleting} />
            </>
          )}
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-2 sm:px-8 py-7 space-y-6 custom-scrollbar">
        {visibleMessages.map((msg) => {
          const isSelected = selectedMessages.has(msg.id);
          const isDeletingThis = deletingMsgIds.has(msg.id);
          return (
            <div onClick={() => toggleMessageSelection(msg.id)} key={msg.id} className={`flex gap-3 group/msg transition-all duration-200 px-2 sm:px-3 py-1 rounded-3xl ${selectionMode ? "cursor-pointer hover:bg-slate-500/10 dark:hover:bg-white/10 active:bg-slate-500/10" : ""} ${msg.senderId === user.id ? "justify-end" : "justify-start"} ${isDeletingThis ? "animate-msg-shrink" : ""}`}>
              {selectionMode && (
                <div className="flex items-center justify-center shrink-0 mr-1.5 cursor-pointer self-center transition-all duration-200 select-none">
                  {isSelected ? <div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-[10px] text-white font-black scale-110 shadow-md shadow-indigo-500/20 transition-all duration-200">✓</div> : <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-transparent hover:border-indigo-500 transition-colors duration-200" />}
                </div>
              )}
              <Message msg={msg} isMe={msg.senderId === user.id} currentUserId={user.id} isSelected={isSelected} selectionMode={selectionMode} bubbleMeClass={activeTheme.bubbleMe} bubbleOtherClass={activeTheme.bubbleOther} onReact={handleReact} />
            </div>
          );
        })}

        {isOtherUserTyping && (
          <div className="flex justify-start items-center gap-3 animate-fade-in mb-1">
            <Avatar size="sm" username={targetTitle} src={targetAvatar} />
            <div className={`px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 ${activeTheme.bubbleOther} shadow-sm`}>
              <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full typing-dot" />
              <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full typing-dot" />
              <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {previewUrl && (
        <div className="relative z-20 mx-3 mb-2 rounded-3xl border chat-glass px-5 sm:px-6 py-4 backdrop-blur-2xl flex flex-col gap-3">
          <div className="relative inline-block max-w-xs">
            {previewFile?.type.startsWith("image") && <img src={previewUrl} className="max-w-xs rounded-xl shadow-md border border-slate-200 dark:border-slate-800" />}
            {previewFile?.type.startsWith("video") && <video src={previewUrl} controls className="max-w-xs rounded-xl shadow-md border border-slate-200 dark:border-slate-800" />}
            {uploadProgress === 0 && <button onClick={() => { setPreviewFile(null); setPreviewUrl(null); setUploadProgress(0); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md transition">x</button>}
          </div>
          {previewFile && text.trim() && uploadProgress === 0 && (
            <div className="max-w-xs rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              Caption: {text}
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="w-full max-w-xs">
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-semibold">Uploading: {uploadProgress}%</p>
            </div>
          )}
          {uploadProgress === 0 && (
            <div className="flex gap-2">
              <button onClick={sendMedia} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 rounded-xl text-xs shadow-md shadow-indigo-500/10 transition">Send media</button>
              <button onClick={() => { setPreviewFile(null); setPreviewUrl(null); setUploadProgress(0); }} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/80 font-semibold px-5 py-2 rounded-xl text-xs transition">Cancel</button>
            </div>
          )}
        </div>
      )}

      <div className="relative z-20 px-3 sm:px-6 pb-4 pt-2 transition-colors">
        {showEmojiPicker && (
          <div className="absolute bottom-24 left-4 sm:left-20 z-30 grid grid-cols-8 gap-1 rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-2xl">
            {COMPOSER_EMOJIS.map((emoji) => (
              <button key={emoji} type="button" onClick={() => setText((prev) => `${prev}${emoji}`)} className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-lg">
                {emoji}
              </button>
            ))}
          </div>
        )}
        <div className="composer-float flex items-center gap-2 sm:gap-3 rounded-[1.75rem] border border-white/70 dark:border-slate-800/90 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl p-2 sm:p-2.5">
          <input id="file" type="file" className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
          <label htmlFor="file" className="h-11 w-11 shrink-0 flex items-center justify-center text-xl rounded-2xl bg-slate-100 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 cursor-pointer text-slate-700 dark:text-slate-300 transition-all shadow-sm hover:-translate-y-0.5" title="Attach Media"><CgSoftwareUpload /></label>
          <button type="button" onClick={() => setShowEmojiPicker((prev) => !prev)} className="h-11 w-11 shrink-0 flex items-center justify-center text-xl rounded-2xl bg-slate-100 hover:bg-white dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all shadow-sm hover:-translate-y-0.5" title="Emoji">☺</button>
          <input value={text} onChange={(e) => { setText(e.target.value); emitTyping(); }} onKeyDown={(e) => e.key === "Enter" && sendText()} placeholder={previewFile ? "Add a caption..." : isAI ? "Ask AI Assistant..." : "Type a message..."} className="flex-1 min-w-0 bg-slate-100/90 text-slate-900 dark:text-slate-100 dark:bg-slate-900/90 px-4 sm:px-5 py-3 rounded-2xl border border-transparent outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold placeholder-slate-400 dark:placeholder-slate-500" />
          {text.trim() && (
            <button type="button" onClick={handleRefineText} disabled={isRefining} className="hidden sm:inline-flex shrink-0 items-center justify-center rounded-2xl border border-emerald-200/80 dark:border-emerald-900/70 bg-emerald-50/90 dark:bg-emerald-950/50 px-4 py-3 text-xs font-black text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-100 dark:hover:bg-emerald-900/70 disabled:opacity-60">
              {isRefining ? "Refining..." : "Refine AI"}
            </button>
          )}
          <button type="button" onClick={previewFile ? sendMedia : sendText} className={`${activeTheme.sendButton} shrink-0 px-5 sm:px-7 py-3 rounded-2xl font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0`}>{previewFile ? "Send media" : "Send"}</button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
