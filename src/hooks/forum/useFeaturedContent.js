import { useState, useEffect } from "react";
import { API_BASE } from "../../api/config";

export const useFeaturedContent = () => {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [featuredComment, setFeaturedComment] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComment, setLoadingComment] = useState(true);

  useEffect(() => {
    let abort = false;
    async function loadFeaturedPost() {
      setLoadingPost(true);
      try {
        const postRes = await fetch(`${API_BASE}/api/posts/featured`);
        if (!postRes.ok) throw new Error("Napaka pri branju featured objave");
        const postData = await postRes.json();
        if (!abort) {
          if (postData.post) setFeaturedPost(postData.post);
          else setFeaturedPost(null);
        }
      } catch (e) {
        console.error(e);
        if (!abort) setFeaturedPost(null);
      } finally {
        if (!abort) setLoadingPost(false);
      }
    }
    loadFeaturedPost();
    return () => { abort = true; };
  }, []);

  useEffect(() => {
    let abort = false;
    async function loadFeaturedComment() {
      setLoadingComment(true);
      try {
        const commentRes = await fetch(`${API_BASE}/api/comments/featured`);
        if (commentRes.ok) {
          const commentData = await commentRes.json();
          if (!abort) {
            if (commentData.comment) setFeaturedComment(commentData.comment);
            else setFeaturedComment(null);
          }
        }
      } catch (e) {
        console.error(e);
        if (!abort) setFeaturedComment(null);
      } finally {
        if (!abort) setLoadingComment(false);
      }
    }
    loadFeaturedComment();
    return () => { abort = true; };
  }, []);

  useEffect(() => {
    const handleFeaturedChange = () => {
      fetch(`${API_BASE}/api/posts/featured`).then(res => res.json()).then(data => {
        if (data.post) setFeaturedPost(data.post);
        else setFeaturedPost(null);
      }).catch(e => console.error(e));
      fetch(`${API_BASE}/api/comments/featured`).then(res => res.json()).then(data => {
        if (data.comment) setFeaturedComment(data.comment);
        else setFeaturedComment(null);
      }).catch(e => console.error(e));
    };
    window.addEventListener("featured-changed", handleFeaturedChange);
    return () => window.removeEventListener("featured-changed", handleFeaturedChange);
  }, []);

  return { featuredPost, featuredComment, loadingPost, loadingComment };
};
