const SearchBox = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="z-10 px-4 py-3 bg-slate-950 border-b border-slate-800">
      <div className="relative">
        {/* Search Icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
          />
        </svg>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="
            w-full pl-10 pr-4 py-2.5
            bg-slate-900 text-sm text-gray-100
            rounded-xl
            outline-none
            border border-slate-800
            placeholder-gray-400
            focus:ring-2 focus:ring-indigo-500
            focus:border-indigo-500
            transition
          "
        />
      </div>
    </div>
  );
};

export default SearchBox;
