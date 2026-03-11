const express = require("express");
const router = express.Router();
const db = require("../config/database");
const requireAdmin = require("../middleware/admin");

router.delete("/posts", requireAdmin, async (req, res) => {
    try {
        await db.query("DELETE FROM comments");
        await db.query("DELETE FROM post_likes");
        const result = await db.query("DELETE FROM posts RETURNING id");

        res.json({
            message: "Vse objave so bile izbrisane",
            deletedCount: result.rowCount
        });
    } catch (err) {
        console.error("Napaka /api/admin/posts DELETE:", err);
        res.status(500).json({ error: "Napaka pri brisanju vseh objav" });
    }
});

router.delete("/comments", requireAdmin, async (req, res) => {
    try {
        const result = await db.query("DELETE FROM comments RETURNING id");

        res.json({
            message: "Vsi komentarji so bili izbrisani",
            deletedCount: result.rowCount
        });
    } catch (err) {
        console.error("Napaka /api/admin/comments DELETE:", err);
        res.status(500).json({ error: "Napaka pri brisanju vseh komentarjev" });
    }
});

router.get("/stats", requireAdmin, async (req, res) => {
    try {
        const postsResult = await db.query("SELECT COUNT(*)::int AS count FROM posts");
        const commentsResult = await db.query("SELECT COUNT(*)::int AS count FROM comments");
        const usersResult = await db.query("SELECT COUNT(*)::int AS count FROM users");

        res.json({
            posts: postsResult.rows[0].count,
            comments: commentsResult.rows[0].count,
            users: usersResult.rows[0].count
        });
    } catch (err) {
        console.error("Napaka /api/admin/stats:", err);
        res.status(500).json({ error: "Napaka pri branju statistike" });
    }
});

module.exports = router;