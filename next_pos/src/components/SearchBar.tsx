"use client";
import { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [query, setQuery] = useState("");

  return (
    <input
      type="text"
      placeholder="Scan a barcode good."
      value={query}
      onChange={e => {
        setQuery(e.target.value);
        onSearch(e.target.value);
      }}
      className="w-full max-w-md px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}
