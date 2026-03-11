import { useState, useEffect } from "react";
import { API_BASE } from "../../api/config";

export const usePostTitle = (postId) => {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!postId) { setTitle(""); return; }
    let abort = false;
    async function loadPostTitle() {
      try {
        const r = await fetch(`${API_BASE}/api/posts/${postId}`, { credentials: 'include' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!abort && data.title) setTitle(data.title);
      } catch (e) {
        console.error(e);
        if (!abort) setTitle("");
      }
    }
    loadPostTitle();
    return () => { abort = true; };
  }, [postId]);

  return title;
};
