import { useMemo } from "react";

export const usePostSearch = (items, searchQuery) => {
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((p) =>
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      (p.author && p.author.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);
  return filteredItems;
};
