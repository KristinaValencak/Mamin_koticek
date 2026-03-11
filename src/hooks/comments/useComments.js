import { useState, useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import { API_BASE } from "../../api/config";

const COMMENTS_PER_PAGE = 15;
const REPLIES_PER_PAGE = 5;

export function useComments(postId) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const toast = useToast();

    useEffect(() => {
        let abort = false;
        async function loadComments() {
            setLoading(true);
            setOffset(0);
            try {
                const r = await fetch(`${API_BASE}/api/posts/${postId}/comments?limit=${COMMENTS_PER_PAGE}&offset=0`, {
                    credentials: 'include'
                });
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const data = await r.json();
                const list = data.items || [];
                if (!abort) {
                    setComments(list);
                    setTotalCount(data.pagination?.total || list.length);
                    setHasMore(list.length < (data.pagination?.total || list.length));
                    setOffset(list.length);
                }
            } catch (e) {
                console.error(e);
                if (!abort) toast({ status: "error", title: "Komentarjev ne morem prebrati." });
            } finally {
                if (!abort) setLoading(false);
            }
        }
        loadComments();
        return () => { abort = true; };
    }, [postId, toast]);

    const loadMoreComments = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        try {
            const currentOffset = comments.length;
            const r = await fetch(`${API_BASE}/api/posts/${postId}/comments?limit=${COMMENTS_PER_PAGE}&offset=${currentOffset}`, {
                credentials: 'include'
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const data = await r.json();
            const newComments = data.items || [];

            setComments(prev => {
                const updated = [...prev, ...newComments];
                const totalLoaded = updated.length;
                setHasMore(totalLoaded < totalCount);
                return updated;
            });
            setOffset(currentOffset + newComments.length);
        } catch (e) {
            console.error(e);
            toast({ status: "error", title: "Napaka pri nalaganju komentarjev." });
        } finally {
            setLoadingMore(false);
        }
    }, [postId, hasMore, loadingMore, totalCount, comments.length, toast]);

    const addComment = async (content, isAnonymous) => {
        try {
            const r = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ content: content.trim(), isAnonymous }),
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const newComment = await r.json();
            setComments((prev) => [newComment, ...prev]);
            setTotalCount(prev => prev + 1);
            toast({ status: "success", title: "Komentar dodan." });
            return newComment;
        } catch (e) {
            console.error(e);
            toast({ status: "error", title: "Komentarja ni bilo mogoče dodati." });
            return null;
        }
    };

    const deleteComment = async (commentId) => {
        try {
            const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
                method: "DELETE",
                credentials: 'include'
            });
            if (res.ok) {
                setComments(prev => prev.filter(comm => comm.id !== commentId));
                setTotalCount(prev => Math.max(0, prev - 1));
                toast({ status: "success", title: "Komentar izbrisan" });
                return true;
            }
            return false;
        } catch (e) {
            toast({ status: "error", title: "Napaka pri brisanju" });
            return false;
        }
    };

    const toggleFeature = async (commentId, isFeatured) => {
        try {
            const res = await fetch(`${API_BASE}/api/comments/${commentId}/feature`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ isFeatured })
            });
            if (res.ok) {
                const data = await res.json();
                setComments(prev => prev.map(comm =>
                    comm.id === commentId ? { ...comm, isFeatured: data.isFeatured } : comm
                ));
                toast({
                    status: "success",
                    title: data.isFeatured ? "Komentar označen kot najboljši tedna" : "Označba odstranjena"
                });
                window.dispatchEvent(new Event("featured-changed"));
                return data.isFeatured;
            }
            return null;
        } catch (e) {
            toast({ status: "error", title: "Napaka pri označevanju" });
            return null;
        }
    };

    const reloadComments = useCallback(async () => {
        setOffset(0);
        try {
            const res = await fetch(`${API_BASE}/api/posts/${postId}/comments?limit=${COMMENTS_PER_PAGE}&offset=0`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                const list = data.items || [];
                setComments(list);
                setTotalCount(data.pagination?.total || list.length);
                setHasMore(list.length < (data.pagination?.total || list.length));
                setOffset(list.length);
            }
        } catch (e) {
            console.error(e);
        }
    }, [postId]);

    return {
        comments,
        loading,
        loadingMore,
        hasMore,
        totalCount,
        loadMoreComments,
        addComment,
        deleteComment,
        toggleFeature,
        reloadComments,
        setComments
    };
}