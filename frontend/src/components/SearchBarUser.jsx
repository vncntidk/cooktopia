import React from "react";
import { Search, Filter } from "lucide-react";

export default function SearchBarUser({ value, onSearch }) {
  return (
    <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-2.5 flex justify-center items-center">
      <div 
        data-property-1="Default" 
        className="w-full h-10 sm:h-12 px-3 sm:px-4 py-2 bg-zinc-300/40 rounded-xl flex justify-between items-center gap-2 sm:gap-3"
      >
        <div className="flex-1 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
          
          <input
            type="text"
            placeholder="Search recipe, profile, and more"
            className="flex-1 bg-transparent border-none outline-none text-black/30 text-sm sm:text-base font-medium font-['Plus_Jakarta_Sans'] placeholder:text-black/30"

            value={value}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <button className="p-2 hover:bg-zinc-400/30 rounded-lg transition-colors">
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
