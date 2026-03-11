import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE } from "../../api/config";

export const useForumPosts = (selectedCategory, view, pageSize = 6) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const pageRef = useRef(1);

  const loadItems = useCallback(async (append = false) => {
    if (append) {
      if (loadingMore) return;
      setLoadingMore(true);
    } else {
      if (loading) return;
      setLoading(true);
      setItems([]);
      setHasMore(true);
      pageRef.current = 1;
    }
    setError("");
    try {
      const currentPage = append ? pageRef.current + 1 : 1;
      let url;
      if (selectedCategory?.slug) {
        url = `${API_BASE}/api/categories/${encodeURIComponent(selectedCategory.slug)}/posts?page=${currentPage}&pageSize=${pageSize}`;
      } else if (view === "latest") {
        url = `${API_BASE}/api/posts?limit=${pageSize}&offset=${(currentPage - 1) * pageSize}`;
      } else {
        url = `${API_BASE}/api/posts?limit=${pageSize}&offset=${(currentPage - 1) * pageSize}&sort=top`;
      }
      const r = await fetch(url, { credentials: 'include' });
      const ct = r.headers.get("content-type") || "";
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      if (!ct.includes("application/json")) {
        const t = await r.text();
        throw new Error(`Pričakovan JSON, dobil: ${ct}. ${t.slice(0, 120)}`);
      }
      const data = await r.json();
      const list = data.items || [];
      if (append) {
        setItems(prev => [...prev, ...list]);
        pageRef.current = currentPage;
        setHasMore(list.length === pageSize);
      } else {
        setItems(list);
        pageRef.current = 1;
        setHasMore(list.length === pageSize);
      }
    } catch (e) {
      setError("Ne morem prebrati objav. Poskusi znova.");
      console.error(e);
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, [selectedCategory?.slug, view, pageSize]);

  const reset = useCallback(() => {
    pageRef.current = 1;
    loadItems(false);
  }, [loadItems]);

  return { items, loading, loadingMore, hasMore, error, loadItems, reset };
};
