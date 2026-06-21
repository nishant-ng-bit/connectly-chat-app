import { useEffect, useState } from "react";
import { createGroupConversation, getConversations } from "../api/conversation.api";
import { Conversation } from "../components/Conversation";
import type { ChatTarget, User } from "../components/Conversation";
import ChatSection from "../components/ChatSection";
import SearchBox from "../components/SearchBox";
import { getUserByQuery } from "../api/user.api";
import { socket } from "../socket";
import { toast } from "react-toastify";

const AI_ID = "000000000000000000000000";

const ChatsPage = () => {
  const [selectedTarget, setSelectedTarget] = useState<ChatTarget | null>(null);
  const [conversations, setConversations] = useState<ChatTarget[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMemberQuery, setGroupMemberQuery] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const [typingMap, setTypingMap] = useState<Record<string, Set<string>>>({});

  const handleSearch = async () => {
    try {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      const res = await getUserByQuery(searchQuery);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Error searching for users:", error);
    }
  };

  const handleGroupMemberSearch = async () => {
    try {
      if (!groupMemberQuery.trim()) {
        setGroupSearchResults([]);
        return;
      }
      const res = await getUserByQuery(groupMemberQuery);
      setGroupSearchResults(res.data.filter((user: User) => user.id !== AI_ID));
    } catch (error) {
      console.error("Error searching for group members:", error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  useEffect(() => {
    handleGroupMemberSearch();
  }, [groupMemberQuery]);

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      const sorted = [...res.data].sort((a, b) => {
        if (a.user?.id === AI_ID) return -1;
        if (b.user?.id === AI_ID) return 1;
        return 0;
      });
      setConversations(sorted);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const refresh = () => {
      fetchConversations();
    };

    socket.on("conversation:updated", refresh);
    return () => {
      socket.off("conversation:updated", refresh);
    };
  }, []);

  const toggleGroupMember = (member: User) => {
    setSelectedMembers((prev) =>
      prev.some((item) => item.id === member.id)
        ? prev.filter((item) => item.id !== member.id)
        : [...prev, member]
    );
  };

  const handleCreateGroup = async () => {
    if (groupName.trim().length < 2) {
      toast.error("Group name must be at least 2 characters");
      return;
    }
    if (selectedMembers.length < 2) {
      toast.error("Pick at least 2 other members for a group");
      return;
    }

    try {
      setIsCreatingGroup(true);
      const res = await createGroupConversation({
        name: groupName,
        memberIds: selectedMembers.map((member) => member.id),
      });
      await fetchConversations();
      setSelectedTarget({
        conversationId: res.data.id,
        isGroup: true,
        name: res.data.name,
        image: res.data.image,
        participants: res.data.participants,
      });
      setShowGroupModal(false);
      setGroupName("");
      setGroupMemberQuery("");
      setSelectedMembers([]);
      toast.success("Group created");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-100 dark:bg-slate-950 overflow-auto">
      <div
        className={`sidebar-shell sm:w-[350px] w-full flex-col border-r dark:border-slate-800/80 border-slate-200/80 ${
          selectedTarget ? "hidden sm:flex" : ""
        }`}
      >
        <div className="border-b border-slate-200/80 dark:border-slate-800/80">
          <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={() => setShowGroupModal(true)}
              className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-white text-sm font-black py-3 transition shadow-xl shadow-slate-900/10"
            >
              New group
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          {searchQuery ? (
            searchResults.length > 0 ? (
              searchResults.map((user) => (
                <Conversation
                  key={user.id}
                  target={{ user, isGroup: false }}
                  setSelectedTarget={setSelectedTarget}
                  isActive={selectedTarget?.user?.id === user.id}
                />
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                No users found
              </p>
            )
          ) : conversations.length > 0 ? (
            conversations.map((item) => (
              <Conversation
                key={item.conversationId || item.user?.id}
                target={item}
                setSelectedTarget={setSelectedTarget}
                isActive={
                  item.isGroup
                    ? selectedTarget?.conversationId === item.conversationId
                    : selectedTarget?.user?.id === item.user?.id
                }
                typing={!!typingMap[item.conversationId || item.user?.id || ""]?.size}
              />
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">
              No conversations yet
            </p>
          )}
        </div>
      </div>

      <main
        className={`flex-1 min-w-0
        ${selectedTarget ? "" : "hidden sm:flex"}`}
      >
        <ChatSection
          selectedTarget={selectedTarget}
          typingMap={typingMap}
          setTypingMap={setTypingMap}
          onConversationChanged={fetchConversations}
        />
      </main>

      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Create group</h2>
              <button
                type="button"
                onClick={() => setShowGroupModal(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300"
              >
                x
              </button>
            </div>

            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full mb-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
            />
            <input
              value={groupMemberQuery}
              onChange={(e) => setGroupMemberQuery(e.target.value)}
              placeholder="Search members"
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
            />

            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 my-3">
                {selectedMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleGroupMember(member)}
                    className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-xs font-semibold"
                  >
                    {member.username} x
                  </button>
                ))}
              </div>
            )}

            <div className="max-h-52 overflow-y-auto my-3 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
              {groupSearchResults.length > 0 ? (
                groupSearchResults.map((member) => {
                  const selected = selectedMembers.some((item) => item.id === member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleGroupMember(member)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{member.username}</span>
                      <span className={`text-xs font-bold ${selected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
                        {selected ? "Selected" : "Add"}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-5 text-center text-sm text-slate-500 dark:text-slate-400">
                  Search users to add at least 2 members.
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={isCreatingGroup}
              onClick={handleCreateGroup}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold py-3 transition"
            >
              {isCreatingGroup ? "Creating..." : "Create group"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsPage;
