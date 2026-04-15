"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDictionary } from "./dictionary-provider";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dict = useDictionary();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const currentTab = searchParams.get("tab");
    if (currentTab) {
      params.set("tab", currentTab);
    }

    startTransition(() => {
      router.push(`/browse?${params.toString()}`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={dict.browse.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-dark-card border border-dark-border text-dark-text placeholder:text-dark-muted focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center min-w-[100px]"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
          ) : (
            dict.common.search
          )}
        </button>
      </div>
    </form>
  );
}
