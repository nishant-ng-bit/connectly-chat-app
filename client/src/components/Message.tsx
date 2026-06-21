import { useState } from "react";

interface Msg {
  seenAt: Date | null;
  id: string;
  senderId: string;
  conversationId: string;
  type: "text" | "image" | "video";
  content?: string;
  mediaUrl?: string;
  createdAt: string;
  reactions?: Record<string, string[]>;
}

// Custom parser to format bold, code blocks, and inline code nicely
const formatMessageContent = (text: string, isMe: boolean) => {
  if (!text) return null;

  // Split text by block code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    // Check if it's a code block
    if (part.startsWith("```") && part.endsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : "";
      const code = match ? match[2] : part.slice(3, -3);

      return (
        <div 
          key={index} 
          className="my-3 rounded-xl overflow-hidden border border-slate-200/20 dark:border-slate-800/80 bg-slate-950 text-slate-100 font-mono text-xs shadow-md"
        >
          <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
            <span>{language || "code"}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code.trim())}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 overflow-x-auto whitespace-pre">
            <code>{code.trim()}</code>
          </pre>
        </div>
      );
    }

    // Process inline bold (**bold**) and inline backticks (`code`)
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    
    const formatted = boldParts.map((bPart, bIndex) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return (
          <strong 
            key={bIndex} 
            className={`font-extrabold ${
              isMe 
                ? "text-white dark:text-slate-950 underline decoration-current/30" 
                : "text-indigo-600 dark:text-indigo-400"
            }`}
          >
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      
      // Inline backticks check
      const codeParts = bPart.split(/(`.*?`)/g);
      return codeParts.map((cPart, cIndex) => {
        if (cPart.startsWith("`") && cPart.endsWith("`")) {
          return (
            <code 
              key={cIndex} 
              className={`px-1.5 py-0.5 rounded font-mono text-xs ${
                isMe
                  ? "bg-white/20 dark:bg-slate-200/80 text-white dark:text-slate-950"
                  : "bg-slate-200/60 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              {cPart.slice(1, -1)}
            </code>
          );
        }
        return cPart;
      });
    });

    return (
      <span key={index} className="whitespace-pre-wrap leading-relaxed">
        {formatted}
      </span>
    );
  });
};

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const Message = ({
  msg,
  isMe,
  currentUserId,
  isSelected = false,
  selectionMode = false,
  bubbleMeClass = "bg-indigo-600 text-white rounded-tr-none",
  bubbleOtherClass = "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-gray-100 rounded-tl-none",
  onReact,
}: {
  msg: Msg;
  isMe: boolean;
  currentUserId: string;
  isSelected?: boolean;
  selectionMode?: boolean;
  bubbleMeClass?: string;
  bubbleOtherClass?: string;
  onReact: (messageId: string, emoji: string) => void;
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const reactionEntries = Object.entries(msg.reactions || {}).filter(([, users]) => users.length > 0);

  const renderReactionControls = () => (
    <>
      {!selectionMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowReactionPicker((prev) => !prev);
          }}
          className={`absolute -top-3 ${isMe ? "-left-3" : "-right-3"} opacity-0 group-hover:opacity-100 focus:opacity-100 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full h-8 w-8 shadow-lg text-sm transition-all hover:scale-105`}
          title="React"
        >
          ☺
        </button>
      )}
      {showReactionPicker && !selectionMode && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-20 -top-13 ${isMe ? "right-0" : "left-0"} flex gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-2 py-1.5 shadow-2xl`}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(msg.id, emoji);
                setShowReactionPicker(false);
              }}
              className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      {reactionEntries.length > 0 && (
        <div className={`absolute -bottom-4 ${isMe ? "right-2" : "left-2"} flex gap-1 rounded-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 shadow-lg`}>
          {reactionEntries.map(([emoji, users]) => (
            <button
              key={emoji}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReact(msg.id, emoji);
              }}
              className={`text-[11px] px-1.5 py-0.5 rounded-full transition hover:bg-slate-100 dark:hover:bg-slate-800 ${users.includes(currentUserId) ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200" : "text-slate-700 dark:text-slate-200"}`}
              title={users.includes(currentUserId) ? "Remove reaction" : "React"}
            >
              {emoji}{users.length > 1 ? ` ${users.length}` : ""}
            </button>
          ))}
        </div>
      )}
    </>
  );

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(msg.mediaUrl || "");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `connectly-image-${msg.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image:", err);
      window.open(msg.mediaUrl, "_blank");
    }
  };

  // Media cards keep controls, captions, and timestamps readable in every theme.
  if (msg.type === "image" || msg.type === "video") {
    const time = new Date(msg.createdAt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <>
        <div
          className={`message-bubble animate-message-rise max-w-[82%] sm:max-w-md overflow-visible transition-all duration-200 relative group rounded-[1.6rem] border bg-white/90 dark:bg-slate-950/90 border-white/80 dark:border-slate-800/80 p-1.5 ${
            isSelected ? "ring-4 ring-indigo-500/40 border-indigo-400/50 scale-[0.98] shadow-lg" : ""
          }`}
        >
          <div className="overflow-hidden rounded-[1.25rem] bg-slate-950/5 dark:bg-white/5">
            {msg.type === "image" && (
              <img
                src={msg.mediaUrl}
                onClick={(e) => {
                  if (selectionMode) return;
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="block w-full max-h-80 object-cover cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
                alt="uploaded"
              />
            )}

            {msg.type === "video" && (
              <video
                src={msg.mediaUrl}
                controls
                className="block w-full max-h-80 object-cover aspect-video bg-black"
              />
            )}
          </div>

          <div className="flex items-end justify-between gap-3 px-2.5 pb-1.5 pt-2">
            <div className="min-w-0 flex-1">
              {msg.content ? (
                <div className={`text-sm leading-relaxed font-medium ${isMe ? "text-slate-900 dark:text-slate-100" : "text-slate-800 dark:text-slate-100"}`}>
                  {formatMessageContent(msg.content, false)}
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Media</span>
              )}
            </div>
            <div className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-900 px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <span>{time}</span>
              {isMe && (msg.seenAt ? <span title="Seen">✓✓</span> : <span title="Sent">✓</span>)}
            </div>
          </div>

          {renderReactionControls()}
        </div>

        {isLightboxOpen && (
          <div
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div className="absolute top-4 right-4 flex items-center gap-3 z-55 animate-slide-down" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleDownload}
                className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-lg transition-all shadow-md flex items-center justify-center cursor-pointer select-none"
                title="Download Image"
              >
                📥
              </button>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-lg transition-all shadow-md flex items-center justify-center cursor-pointer select-none"
                title="Close"
              >
                ✕
              </button>
            </div>

            <img
              src={msg.mediaUrl}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-zoom-in"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    );
  }

  // Text message bubble styling (classic)
  return (
    <div
      className={`message-bubble animate-message-rise max-w-[78%] sm:max-w-md px-4 py-3 text-sm break-words transition-all duration-200 relative ${
        isMe
          ? `${bubbleMeClass} rounded-3xl rounded-tr-md`
          : `${bubbleOtherClass} rounded-3xl rounded-tl-md`
      } ${
        isSelected
          ? "ring-4 ring-indigo-500/40 border border-indigo-400/50 scale-[0.98] shadow-md"
          : ""
      }`}
    >
      {renderReactionControls()}
      <div className="leading-relaxed select-text tracking-[0.005em]">
        {formatMessageContent(msg.content || "", isMe)}
      </div>

      <div className={`text-[10px] mt-2 flex items-center justify-end gap-1.5 opacity-75 ${isMe ? 'text-white/80 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
        <span>
          {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </span>
        {isMe && (
          msg.seenAt ? (
            <span className="text-white/80 dark:text-slate-500 font-bold" title="Seen">✓✓</span>
          ) : (
            <span className="text-white/60 dark:text-slate-500" title="Sent">✓</span>
          )
        )}
      </div>
    </div>
  );
};

export default Message;
