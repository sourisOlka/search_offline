'use client';
import { useDebounceCallback } from '@/src/shared';

interface SearchProps {
  onSearch: (str: string) => void;
}

export const Search = ({ onSearch }: SearchProps) => {
  const debouncedSearch = useDebounceCallback(onSearch);

  return (
    <div className="group relative mb-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        onChange={(e) => debouncedSearch(e.target.value)}
        placeholder="Поиск..."
        maxLength={80}
        className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
      />
    </div>
  );
};
