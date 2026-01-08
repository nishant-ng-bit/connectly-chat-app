import { useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
const ChatSectionSettings = ({
  toggleSelectionMode,
  handleClearConversation,
  isDeleting,
  setIsDeleting,
}: {
  toggleSelectionMode: () => void;
  handleClearConversation: () => void;
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    !isDeleting && (
      <div className="relative flex">
        <button
          type="button"
          onClick={() => setShowSettings((prev) => !prev)}
          className="
          text-2xl 
          text-slate-600 dark:text-gray-300
          hover:text-slate-900 dark:hover:text-white
          transition
        "
        >
          {showSettings ? <RxCross2 /> : <IoSettingsOutline />}
        </button>

        {showSettings && (
          <div
            className="
            absolute right-0 top-10 z-50
            w-44
            bg-white dark:bg-slate-900
            border border-gray-200 dark:border-slate-800
            rounded-xl shadow-lg
            overflow-hidden
          "
          >
            <button
              onClick={() => {
                toggleSelectionMode();

                setShowSettings(false);
              }}
              className="
              w-full text-left
              px-4 py-2
              text-sm
              text-slate-700 dark:text-gray-200
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition
            "
            >
              Delete Chats
            </button>

            <button
              onClick={() => {
                setShowSettings(false);
                setIsDeleting(true);
                handleClearConversation();
              }}
              className="
              w-full text-left
              px-4 py-2
              text-sm
              text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-500/10
              transition
            "
            >
              Clear All Chats
            </button>
          </div>
        )}
      </div>
    )
  );
};

export default ChatSectionSettings;
