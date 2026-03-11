import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { API_BASE } from "../../api/config";

export function usePost(postId) {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [likes, setLikes] = useState({ count: 0, isLiked: false });
    const [liking, setLiking] = useState(false);
    const toast = useToast();

    useEffect(() => {
        let abort = false;
        async function loadPost() {
            setLoading(true);
            setError("");
            try {
                const r = await fetch(`${API_BASE}/api/posts/${postId}`);
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const data = await r.json();
                if (!abort) setPost(data);
            } catch (e) {
                console.error(e);
                if (!abort) setError("Ne morem prebrati objave.");
            } finally {
                if (!abort) setLoading(false);
            }
        }
        loadPost();
        return () => { abort = true; };
    }, [postId]);

    useEffect(() => {
        let abort = false;
        async function loadLikes() {
            try {
                const r = await fetch(`${API_BASE}/api/posts/${postId}/likes`, {
                    credentials: 'include'
                });
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const data = await r.json();
                if (!abort) setLikes(data);
            } catch (e) {
                console.error(e);
            }
        }
        loadLikes();
        return () => { abort = true; };
    }, [postId]);

    const handleLike = async () => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
            toast({ status: "warning", title: "Za lajkanje se morate prijaviti." });
            return;
        }

        setLiking(true);
        try {
            const r = await fetch(`${API_BASE}/api/posts/${postId}/likes`, {
                method: "POST",
                credentials: 'include'
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const data = await r.json();

            setLikes(prev => ({
                count: data.action === "liked" ? prev.count + 1 : prev.count - 1,
                isLiked: data.action === "liked"
            }));
        } catch (e) {
            console.error(e);
            toast({ status: "error", title: "Napaka pri lajkanju." });
        } finally {
            setLiking(false);
        }
    };

    const deletePost = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
                method: "DELETE",
                credentials: 'include'
            });
            if (res.ok) {
                toast({ status: "success", title: "Objava izbrisana" });
                return true;
            }
            return false;
        } catch (e) {
            toast({ status: "error", title: "Napaka pri brisanju" });
            return false;
        }
    };

    const toggleFeature = async (isFeatured) => {
        try {
            const res = await fetch(`${API_BASE}/api/posts/${postId}/feature`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ isFeatured })
            });
            if (res.ok) {
                const data = await res.json();
                setPost(prev => ({ ...prev, isFeatured: data.isFeatured }));
                toast({
                    status: "success",
                    title: data.isFeatured ? "Objava označena kot najboljša tedna" : "Označba odstranjena"
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

    return {
        post,
        loading,
        error,
        likes,
        liking,
        handleLike,
        deletePost,
        toggleFeature,
        setPost
    };
}