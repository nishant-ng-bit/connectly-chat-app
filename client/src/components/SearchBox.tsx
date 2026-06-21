import { IoSearch } from "react-icons/io5";

const SearchBox = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="z-10 px-4 pt-4 pb-3">
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 dark:from-slate-100 dark:via-slate-200 dark:to-emerald-100 dark:text-slate-950 p-4 text-white shadow-xl shadow-indigo-500/20">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 dark:text-slate-500 font-bold">Connectly</p>
        <h2 className="mt-1 text-xl font-black tracking-tight">Messages</h2>
        <p className="mt-1 text-xs text-white/75 dark:text-slate-600 font-medium">Realtime chats, groups, reactions, and media.</p>
      </div>

      <div
        className="flex items-center justify-center gap-2 text-sm w-full px-3 py-2.5 rounded-2xl
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
        border border-slate-200/80 dark:border-slate-800
        shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/15 focus-within:border-indigo-500/50 transition-all"
      >
        <div className="text-xl text-indigo-500 dark:text-indigo-400">
          <IoSearch />
        </div>

        <input
          className="outline-none dark:text-slate-100 text-slate-900 font-semibold bg-transparent w-full placeholder:text-slate-400"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people..."
        />
      </div>
    </div>
  );
};

export default SearchBox;
