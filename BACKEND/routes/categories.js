const express = require("express");
const router = express.Router();
const db = require("../config/database");
const jwt = require("jsonwebtoken");

router.get("/", async (_req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT id, name, slug, description, sort_order
         FROM categories
         ORDER BY sort_order ASC, name ASC`
        );
        res.json(rows);
    } catch (err) {
        console.error("Napaka /api/categories:", err);
        res.status(500).json({ error: "Napaka pri branju kategorij" });
    }
});





router.get("/:slug/posts", async (req, res) => {
    try {
        const { slug } = req.params;
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const pageSize = Math.min(parseInt(req.query.pageSize || "20", 10), 100);
        const offset = (page - 1) * pageSize;
        const auth = req.headers["authorization"];
        let userId = null;

        if (auth) {
            try {
                const token = auth.split(" ")[1];
                const payload = jwt.verify(token, process.env.JWT_SECRET);
                userId = payload.id;
            } catch (e) {}
        }

        const cat = await db.query(
            `SELECT id, name, slug FROM categories WHERE slug = $1 LIMIT 1`,
            [slug]
        );
        if (cat.rowCount === 0) {
            return res.status(404).json({ error: "Kategorija ne obstaja." });
        }
        const categoryId = cat.rows[0].id;

        const list = await db.query(
            `
            SELECT p.id,
               p.title,
               p.content,
               p.created_at AS "createdAt",
               CASE 
                 WHEN p.is_anonymous = true THEN NULL
                 ELSE u.id
               END AS "userId",
               CASE 
                 WHEN p.is_anonymous = true THEN 'Anonimna uporabnica #' || u.id
                 ELSE u.username 
               END AS "author",
                   COALESCE(like_counts.like_count, 0) AS "likeCount",
                   CASE WHEN user_likes.post_id IS NOT NULL THEN true ELSE false END AS "isLiked",
                   COALESCE(comment_counts.comment_count, 0) AS "commentCount"
            FROM posts p
            JOIN users u ON u.id = p.user_id
            LEFT JOIN (
              SELECT post_id, COUNT(*)::int AS like_count
              FROM post_likes
              GROUP BY post_id
            ) like_counts ON like_counts.post_id = p.id
            LEFT JOIN (
              SELECT post_id
              FROM post_likes
              WHERE user_id = $4
            ) user_likes ON user_likes.post_id = p.id
            LEFT JOIN (
              SELECT post_id, COUNT(*)::int AS comment_count
              FROM comments
              GROUP BY post_id
            ) comment_counts ON comment_counts.post_id = p.id
            WHERE p.category_id = $1
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
            `,
            [categoryId, pageSize, offset, userId || null]
        );

        const totalRes = await db.query(
            `SELECT COUNT(*)::int AS count FROM posts WHERE category_id = $1`,
            [categoryId]
        );

        res.json({
            category: cat.rows[0],
            items: list.rows,
            pagination: {
                page,
                pageSize,
                total: totalRes.rows[0].count,
                pages: Math.ceil(totalRes.rows[0].count / pageSize),
            },
        });
    } catch (err) {
        console.error("Napaka /api/categories/:slug/posts:", err);
        res.status(500).json({ error: "Napaka pri branju objav kategorije" });
    }
});

module.exports = router;
