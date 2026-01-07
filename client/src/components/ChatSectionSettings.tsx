import { useState } from "react";

const ChatSectionSettings = () => {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowSettings(!showSettings)}
        className="text-2xl"
      >
        ⚙️
      </button>
      {showSettings && (
        <div className="w-40 bg-amber-500 absolute top-10 -left-30 flex flex-col ">
          <button className="hover:bg-amber-900 w-full">Delete Chats</button>
          <button className="hover:bg-amber-900 w-full">Clear All Chats</button>
          <button className="hover:bg-amber-900 w-full">Chat Lock</button>
        </div>
      )}
    </div>
  );
};

export default ChatSectionSettings;
