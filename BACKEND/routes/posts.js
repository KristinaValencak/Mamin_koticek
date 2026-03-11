const express = require("express");
const router = express.Router();
const db = require("../config/database");
const requireAuth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const emailService = require("../services/emailService");

router.get("/", async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
        const offset = parseInt(req.query.offset || "0", 10);
        const auth = req.headers["authorization"];
        let userId = null;

        if (auth) {
            try {
                const token = auth.split(" ")[1];
                const payload = jwt.verify(token, process.env.JWT_SECRET);
                userId = payload.id;
            } catch (e) {}
        }

        const q = `
        SELECT p.id,
              p.title,
              p.content,
              p.created_at AS "createdAt",
              p.is_featured AS "isFeatured",
              CASE 
                WHEN p.is_anonymous = true THEN NULL
                ELSE u.id
              END AS "userId",
       CASE 
         WHEN p.is_anonymous = true THEN 'Anonimna uporabnica #' || u.id
         ELSE u.username 
       END AS "author",
       c.name        AS "categoryName",
       c.slug        AS "categorySlug",
       COALESCE(like_counts.like_count, 0) AS "likeCount",
       CASE WHEN user_likes.post_id IS NOT NULL THEN true ELSE false END AS "isLiked",
       COALESCE(comment_counts.comment_count, 0) AS "commentCount"
  FROM posts p
  JOIN users u      ON u.id = p.user_id
  LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN (
          SELECT post_id, COUNT(*)::int AS like_count
          FROM post_likes
          GROUP BY post_id
        ) like_counts ON like_counts.post_id = p.id
        LEFT JOIN (
          SELECT post_id
          FROM post_likes
          WHERE user_id = $3
        ) user_likes ON user_likes.post_id = p.id
        LEFT JOIN (
          SELECT post_id, COUNT(*)::int AS comment_count
          FROM comments
          GROUP BY post_id
        ) comment_counts ON comment_counts.post_id = p.id
        ORDER BY p.is_featured DESC, p.created_at DESC
        LIMIT $1 OFFSET $2
      `;
        const { rows } = await db.query(q, [limit, offset, userId || null]);
        res.json({ items: rows, pagination: { limit, offset } });
    } catch (err) {
        console.error("Napaka /api/posts:", err);
        res.status(500).json({ error: "Napaka pri branju objav" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { title, content, categoryId, userId, isAnonymous } = req.body;

        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({ message: "Naslov in vsebina sta obvezna." });
        }
        if (!userId) {
            return res.status(401).json({ message: "Manjka userId." });
        }

        const u = await db.query("SELECT id FROM users WHERE id=$1", [userId]);
        if (u.rowCount === 0) {
            return res.status(400).json({ message: "Neveljaven uporabnik." });
        }

        let catId = null;
        if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
            const c = await db.query("SELECT id FROM categories WHERE id=$1", [categoryId]);
            if (c.rowCount === 0) {
                return res.status(400).json({ message: "Neveljavna kategorija." });
            }
            catId = Number(categoryId);
        }

        const ins = await db.query(
            `INSERT INTO posts (title, content, category_id, user_id, is_anonymous)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, title, content,
                       category_id AS "categoryId",
                       user_id     AS "userId",
                       created_at  AS "createdAt",
                       is_anonymous AS "isAnonymous"`,
            [title.trim(), content.trim(), catId, userId, isAnonymous === true]
        );

        return res.status(201).json(ins.rows[0]);
    } catch (err) {
        console.error("Napaka /api/posts:", err);
        return res.status(500).json({ message: err.message, code: err.code, detail: err.detail, column: err.column });
    }
});

router.get("/featured", async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT p.id,
                p.title,
                p.content,
                p.created_at AS "createdAt",
                p.is_featured AS "isFeatured",
                CASE 
                  WHEN p.is_anonymous = true THEN NULL
                  ELSE u.id
                END AS "userId",
                CASE 
                  WHEN p.is_anonymous = true THEN 'Anonimna uporabnica #' || u.id
                  ELSE u.username 
                END AS author
             FROM posts p
             JOIN users u ON u.id = p.user_id
             WHERE p.is_featured = TRUE
             ORDER BY p.created_at DESC
             LIMIT 1`
        );

        if (rows.length === 0) {
            return res.json({ post: null, type: null });
        }

        res.json({ post: rows[0], type: "post" });
    } catch (err) {
        console.error("Napaka /api/posts/featured:", err);
        res.status(500).json({ error: "Napaka pri branju featured objave" });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { rows } = await db.query(
        `SELECT 
        p.id,
        p.title,
        p.content,
        p.created_at AS "createdAt",
        p.is_featured AS "isFeatured",
        CASE 
          WHEN p.is_anonymous = true THEN NULL
          ELSE u.id
        END AS "userId",
        CASE 
          WHEN p.is_anonymous = true THEN 'Anonimna uporabnica #' || u.id
          ELSE u.username 
        END AS author,
            json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
        [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    const r = rows[0];
    res.json({
        id: r.id,
        title: r.title,
        content: r.content,
        createdAt: r.createdAt,
        isFeatured: r.isFeatured || false,
        userId: r.userId,
        author: r.author,
        category: r.category
    });
});

router.put("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, content, categoryId } = req.body;

        const check = await db.query(
            "SELECT user_id FROM posts WHERE id = $1",
            [id]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Objava ne obstaja" });
        }

        if (check.rows[0].user_id !== userId) {
            return res.status(403).json({ error: "Nimate dovoljenja za urejanje te objave" });
        }

        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({ message: "Naslov in vsebina sta obvezna." });
        }

        let catId = null;
        if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
            const c = await db.query("SELECT id FROM categories WHERE id=$1", [categoryId]);
            if (c.rowCount === 0) {
                return res.status(400).json({ message: "Neveljavna kategorija." });
            }
            catId = Number(categoryId);
        }

        const { rows } = await db.query(
            `UPDATE posts 
         SET title = $1, content = $2, category_id = $3
         WHERE id = $4 AND user_id = $5
         RETURNING id, title, content,
                   category_id AS "categoryId",
                   user_id AS "userId",
                   created_at AS "createdAt"`,
            [title.trim(), content.trim(), catId, id, userId]
        );

        res.json(rows[0]);
    } catch (err) {
        console.error("Napaka /api/posts/:id PUT:", err);
        res.status(500).json({ error: "Napaka pri posodabljanju objave" });
    }
});

router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const check = await db.query(
            "SELECT user_id FROM posts WHERE id = $1",
            [id]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Objava ne obstaja" });
        }

        const userCheck = await db.query(
            "SELECT is_admin FROM users WHERE id = $1",
            [userId]
        );
        const isAdmin = userCheck.rows.length > 0 && userCheck.rows[0].is_admin;

        if (check.rows[0].user_id !== userId && !isAdmin) {
            return res.status(403).json({ error: "Nimate dovoljenja za brisanje te objave" });
        }

        await db.query("DELETE FROM comments WHERE post_id = $1", [id]);
        await db.query("DELETE FROM posts WHERE id = $1", [id]);

        res.json({ message: "Objava je bila izbrisana" });
    } catch (err) {
        console.error("Napaka /api/posts/:id DELETE:", err);
        res.status(500).json({ error: "Napaka pri brisanju objave" });
    }
});

router.get("/:id/likes", async (req, res) => {
    try {
        const { id } = req.params;
        const auth = req.headers["authorization"];
        let userId = null;

        if (auth) {
            try {
                const token = auth.split(" ")[1];
                const payload = jwt.verify(token, process.env.JWT_SECRET);
                userId = payload.id;
            } catch (e) {}
        }

        const countRes = await db.query(
            "SELECT COUNT(*)::int AS count FROM post_likes WHERE post_id = $1",
            [id]
        );
        const likeCount = countRes.rows[0].count;

        let isLiked = false;
        if (userId) {
            const likeRes = await db.query(
                "SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2",
                [id, userId]
            );
            isLiked = likeRes.rowCount > 0;
        }

        res.json({
            count: likeCount,
            isLiked: isLiked
        });
    } catch (err) {
        console.error("Napaka /api/posts/:id/likes:", err);
        res.status(500).json({ error: "Napaka pri branju lajkov" });
    }
});

router.post("/:id/likes", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const postCheck = await db.query("SELECT id FROM posts WHERE id = $1", [id]);
        if (postCheck.rowCount === 0) {
            return res.status(404).json({ error: "Objava ne obstaja" });
        }

        const existing = await db.query(
            "SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2",
            [id, userId]
        );

        if (existing.rowCount > 0) {
            await db.query(
                "DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2",
                [id, userId]
            );
            res.json({ action: "unliked", message: "Lajk odstranjen" });
        } else {
            await db.query(
                "INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)",
                [id, userId]
            );
            res.json({ action: "liked", message: "Objava lajkana" });
        }
    } catch (err) {
        console.error("Napaka /api/posts/:id/likes POST:", err);
        if (err.code === '23505') {
            return res.status(409).json({ error: "Objava je že lajkana" });
        }
        res.status(500).json({ error: "Napaka pri lajkanju" });
    }
});

router.get("/:id/comments", async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
        const offset = parseInt(req.query.offset || "0", 10);
        const { id } = req.params;

        const postCheck = await db.query("SELECT id FROM posts WHERE id = $1", [id]);
        if (postCheck.rowCount === 0) {
            return res.status(404).json({ error: "Objava ne obstaja" });
        }

        let userId = null;
        const auth = req.headers["authorization"];
        if (auth) {
            try {
                const token = auth.split(" ")[1];
                const payload = jwt.verify(token, process.env.JWT_SECRET);
                userId = payload.id;
            } catch (err) {}
        }

        const { rows } = await db.query(
            `SELECT c.id,
                c.content,
                c.created_at AS "createdAt",
                c.is_featured AS "isFeatured",
                c.parent_comment_id AS "parentCommentId",
                CASE 
                  WHEN c.is_anonymous = true THEN NULL
                  ELSE u.id
                END AS "userId",
                CASE 
                  WHEN c.is_anonymous = true THEN 'Anonimen član'
                  ELSE u.username 
                END AS username,
                COALESCE(like_counts.like_count, 0) AS "likeCount",
                CASE WHEN user_likes.comment_id IS NOT NULL THEN true ELSE false END AS "isLiked"
             FROM comments c
             JOIN users u ON u.id = c.user_id
             LEFT JOIN (
               SELECT comment_id, COUNT(*)::int AS like_count
               FROM comment_likes
               GROUP BY comment_id
             ) like_counts ON like_counts.comment_id = c.id
             LEFT JOIN (
               SELECT comment_id
               FROM comment_likes
               WHERE user_id = $4
             ) user_likes ON user_likes.comment_id = c.id
             WHERE c.post_id = $1
             ORDER BY 
               CASE WHEN c.parent_comment_id IS NULL THEN 0 ELSE 1 END,
               c.created_at ASC
             LIMIT $2 OFFSET $3`,
            [id, limit, offset, userId || 0]
        );

        const countRes = await db.query(
            "SELECT COUNT(*)::int AS count FROM comments WHERE post_id = $1",
            [id]
        );

        res.json({
            items: rows.map(r => ({
                id: r.id,
                content: r.content,
                createdAt: r.createdAt,
                isFeatured: r.isFeatured || false,
                parentCommentId: r.parentCommentId || null,
                likeCount: r.likeCount || 0,
                isLiked: r.isLiked || false,
                user: {
                    id: r.userId || null,
                    username: r.username
                }
            })),
            pagination: {
                limit,
                offset,
                total: countRes.rows[0].count
            }
        });
    } catch (err) {
        console.error("Napaka /api/posts/:id/comments:", err);
        res.status(500).json({ error: "Napaka pri branju komentarjev" });
    }
});

router.post("/:id/comments", requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { content, isAnonymous } = req.body;

    if (!content?.trim()) {
        return res.status(400).json({ error: "Vsebina je obvezna" });
    }

    const postOwner = await db.query("SELECT user_id FROM posts WHERE id = $1", [id]);
    if (postOwner.rowCount === 0) {
        return res.status(404).json({ error: "Objava ne obstaja" });
    }

    const { rows } = await db.query(
        `INSERT INTO comments (post_id, user_id, content, is_anonymous)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, created_at`,
        [id, userId, content.trim(), isAnonymous === true]
    );

    if (postOwner.rows[0].user_id !== userId) {
        try {
            await db.query(
                `INSERT INTO notifications (user_id, type, post_id, actor_id)
           VALUES ($1, 'comment', $2, $3)`,
                [postOwner.rows[0].user_id, id, userId]
            );
        } catch (notifErr) {
            console.error("Napaka pri ustvarjanju notifikacije:", notifErr);
        }
    }

    res.status(201).json({
        id: rows[0].id,
        content: rows[0].content,
        createdAt: rows[0].created_at,
        user: {
            id: userId,
            username: isAnonymous === true ? "Anonimen član" : req.user.username
        }
    });
});

router.post("/:id/report", async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const { reason, postTitle, postAuthor } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ error: "Razlog prijave je obvezen." });
        }

        const postCheck = await db.query("SELECT id, title, user_id FROM posts WHERE id = $1", [postId]);
        if (postCheck.rowCount === 0) {
            return res.status(404).json({ error: "Objava ne obstaja." });
        }

        let reporterEmail = null;
        const auth = req.headers["authorization"];
        if (auth) {
            try {
                const token = auth.split(" ")[1];
                const payload = jwt.verify(token, process.env.JWT_SECRET);
                const userResult = await db.query("SELECT email, username FROM users WHERE id = $1", [payload.id]);
                if (userResult.rowCount > 0) {
                    reporterEmail = userResult.rows[0].email;
                }
            } catch (err) {}
        }

        try {
            await emailService.sendReportEmail(
                postTitle || postCheck.rows[0].title,
                postAuthor || "Neznano",
                postId,
                reason.trim(),
                reporterEmail
            );
        } catch (emailError) {
            console.error("Error sending report email:", emailError);
        }

        res.status(200).json({ message: "Prijava uspešno poslana." });
    } catch (err) {
        console.error("Napaka pri prijavi objave:", err);
        res.status(500).json({ error: "Napaka pri pošiljanju prijave." });
    }
});

router.put("/:id/feature", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { isFeatured } = req.body;

        const userCheck = await db.query(
            "SELECT is_admin FROM users WHERE id = $1",
            [userId]
        );
        const isAdmin = userCheck.rows.length > 0 && userCheck.rows[0].is_admin;

        if (!isAdmin) {
            return res.status(403).json({ error: "Nimate admin dovoljenj" });
        }

        const check = await db.query("SELECT id FROM posts WHERE id = $1", [id]);
        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Objava ne obstaja" });
        }

        if (isFeatured === true) {
            await db.query(
                `UPDATE posts 
             SET is_featured = FALSE 
             WHERE is_featured = TRUE AND id != $1`,
                [id]
            );
        }

        const { rows } = await db.query(
            `UPDATE posts 
         SET is_featured = $1 
         WHERE id = $2 
         RETURNING id, is_featured AS "isFeatured"`,
            [isFeatured === true, id]
        );

        res.json({
            id: rows[0].id,
            isFeatured: rows[0].isFeatured,
            message: isFeatured ? "Objava označena kot najboljša tedna" : "Označba odstranjena"
        });
    } catch (err) {
        console.error("Napaka /api/posts/:id/feature:", err);
        res.status(500).json({ error: "Napaka pri označevanju objave" });
    }
});


module.exports = router;