import { IoSearch } from "react-icons/io5";
const SearchBox = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="z-10 px-4 py-3 dark:bg-slate-950 bg-white border-b dark:border-slate-800 border-slate-200">
      <div
        className="flex items-center justify-center gap-2  text-black
            dark:bg-slate-900 bg-slate-100 text-sm dark:text-gray-100 
            w-full p-2 rounded-xl focus-within:ring-2 ring-indigo-500 "
      >
        <div className="text-xl ml-2 text-gray-400">
          <IoSearch />
        </div>

        <input
          className="outline-none dark:text-gray-300  text-black font-medium bg-transparent w-full"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
        />
      </div>
    </div>
  );
};

export default SearchBox;
