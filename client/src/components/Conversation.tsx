interface User {
  id: string;
  username: string;
  email: string;
}

interface ConversationProps {
  user: User;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const Conversation = ({ user, setSelectedUser }: ConversationProps) => {
  return (
    <button
      onClick={() => setSelectedUser(user)}
      className="
        flex items-center gap-3
        w-full px-4 py-3
        bg-gray-800 text-white
        hover:bg-gray-700
        transition-colors duration-200
        text-left
      "
    >
      <div
        className="
          w-10 h-10
          rounded-full
          bg-indigo-500
          flex items-center justify-center
          font-semibold
          uppercase
        "
      >
        {user.username[0]}
      </div>

      <span className="font-medium truncate">{user.username}</span>
    </button>
  );
};

export default Conversation;
