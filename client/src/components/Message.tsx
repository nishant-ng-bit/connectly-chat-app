interface Msg {
  seenAt: Date | null;
  id: string;
  senderId: string;
  conversationId: string;
  type: "text" | "image" | "video";
  content?: string;
  mediaUrl?: string;
  createdAt: string;
}

const Message = ({ msg, isMe }: { msg: Msg; isMe: boolean }) => {
  return (
    <div
      className={` max-w-xs rounded-2xl px-4 py-2 text-sm wrap-break-word ${
        isMe
          ? "dark:bg-indigo-600 text-white rounded-br-sm bg-black"
          : "dark:bg-gray-800 text-gray-100 rounded-bl-sm bg-slate-600"
      }`}
    >
      {msg.type === "text" && <p>{msg.content}</p>}

      {msg.type === "image" && (
        <img
          src={msg.mediaUrl}
          className="rounded-lg max-w-full"
          alt="uploaded"
        />
      )}

      {msg.type === "video" && (
        <video
          src={msg.mediaUrl}
          controls
          className="rounded-lg max-w-full max-h-full aspect-auto"
        />
      )}
      <div className="relative left-2 text-xs flex gap-1">
        <p className="text-gray-400">
          {new Date(msg.createdAt).toLocaleString("en-IN", {
            timeStyle: "short",
          })}
        </p>
        {isMe &&
          (msg.seenAt ? (
            <p className="text-green-700">✅</p>
          ) : (
            <p className="text-gray-400">✔️</p>
          ))}
      </div>
    </div>
  );
};

export default Message;
