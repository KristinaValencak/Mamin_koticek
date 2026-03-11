import { useEffect } from "react";
import { debounce } from "../../utils/helpers";

export const useInfiniteScroll = (loadMore, hasMore, loading, loadingMore, searchQuery) => {
  useEffect(() => {
    if (searchQuery || !hasMore || loading || loadingMore) return;
    const debouncedHandleScroll = debounce(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollTop + windowHeight >= documentHeight - 200) loadMore(true);
    }, 100);
    window.addEventListener("scroll", debouncedHandleScroll, { passive: true });
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [hasMore, loading, loadingMore, searchQuery, loadMore]);
};
