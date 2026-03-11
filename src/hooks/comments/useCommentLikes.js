import { useState, useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import { API_BASE } from "../../api/config";

export function useCommentLikes(comments) {
    const [commentLikes, setCommentLikes] = useState({});
    const [likingComments, setLikingComments] = useState({});
    const toast = useToast();

    const loadCommentLikes = useCallback(async (commentId) => {
        try {
            const res = await fetch(`${API_BASE}/api/comments/${commentId}/likes`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setCommentLikes(prev => ({
                    ...prev,
                    [commentId]: { count: data.count, isLiked: data.isLiked }
                }));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        if (comments.length === 0) return;

        comments.forEach(comment => {
            loadCommentLikes(comment.id);
        });
    }, [comments, loadCommentLikes]);

    const handleLike = async (commentId, e) => {
        if (e) e.stopPropagation();
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
            toast({ status: "warning", title: "Za lajkanje se morate prijaviti." });
            return;
        }

        setLikingComments(prev => ({ ...prev, [commentId]: true }));
        try {
            const res = await fetch(`${API_BASE}/api/comments/${commentId}/likes`, {
                method: "POST",
                credentials: 'include'
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            setCommentLikes(prev => ({
                ...prev,
                [commentId]: {
                    count: data.action === "liked"
                        ? (prev[commentId]?.count || 0) + 1
                        : Math.max((prev[commentId]?.count || 0) - 1, 0),
                    isLiked: data.action === "liked"
                }
            }));
        } catch (e) {
            console.error(e);
            toast({ status: "error", title: "Napaka pri lajkanju." });
        } finally {
            setLikingComments(prev => ({ ...prev, [commentId]: false }));
        }
    };

    return {
        commentLikes,
        likingComments,
        handleLike,
        loadCommentLikes
    };
}