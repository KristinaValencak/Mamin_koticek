const express = require("express");
const router = express.Router();
const db = require("../config/database");
const emailService = require("../services/emailService");
const jwt = require("jsonwebtoken");
const requireAuth = require("../middleware/auth");

router.post("/:id/report", async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const { reason, commentContent, commentAuthor } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ error: "Razlog prijave je obvezen." });
        }

        const commentCheck = await db.query(
            `SELECT c.id, c.content, c.post_id, p.title as post_title
         FROM comments c
         JOIN posts p ON c.post_id = p.id
         WHERE c.id = $1`,
            [commentId]
        );

        if (commentCheck.rowCount === 0) {
            return res.status(404).json({ error: "Komentar ne obstaja." });
        }

        const comment = commentCheck.rows[0];

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
            await emailService.sendCommentReportEmail(
                commentContent || comment.content,
                commentAuthor || "Neznano",
                commentId,
                comment.post_title,
                comment.post_id,
                reason.trim(),
                reporterEmail
            );
        } catch (emailError) {
            console.error("Error sending comment report email:", emailError);
        }

        res.status(200).json({ message: "Prijava uspešno poslana." });
    } catch (err) {
        console.error("Napaka pri prijavi komentarja:", err);
        res.status(500).json({ error: "Napaka pri pošiljanju prijave." });
    }
});

router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const check = await db.query(
            "SELECT user_id FROM comments WHERE id = $1",
            [id]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Komentar ne obstaja" });
        }

        const userCheck = await db.query(
            "SELECT is_admin FROM users WHERE id = $1",
            [userId]
        );
        const isAdmin = userCheck.rows.length > 0 && userCheck.rows[0].is_admin;

        if (check.rows[0].user_id !== userId && !isAdmin) {
            return res.status(403).json({ error: "Nimate dovoljenja za brisanje tega komentarja" });
        }

        await db.query("DELETE FROM comments WHERE id = $1", [id]);

        res.json({ message: "Komentar je bil izbrisan" });
    } catch (err) {
        console.error("Napaka /api/comments/:id DELETE:", err);
        res.status(500).json({ error: "Napaka pri brisanju komentarja" });
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

        const check = await db.query("SELECT id FROM comments WHERE id = $1", [id]);
        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Komentar ne obstaja" });
        }

        if (isFeatured === true) {
            await db.query(
                `UPDATE comments 
         SET is_featured = FALSE 
         WHERE is_featured = TRUE AND id != $1`,
                [id]
            );
        }

        const { rows } = await db.query(
            `UPDATE comments 
     SET is_featured = $1 
     WHERE id = $2 
     RETURNING id, is_featured AS "isFeatured"`,
            [isFeatured === true, id]
        );

        res.json({
            id: rows[0].id,
            isFeatured: rows[0].isFeatured,
            message: isFeatured ? "Komentar označen kot najboljši tedna" : "Označba odstranjena"
        });
    } catch (err) {
        console.error("Napaka /api/comments/:id/feature:", err);
        res.status(500).json({ error: "Napaka pri označevanju komentarja" });
    }
});

router.get("/featured", async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT c.id,
                c.content,
                c.created_at AS "createdAt",
                c.is_featured AS "isFeatured",
                c.post_id AS "postId",
                p.title AS "postTitle",
                CASE 
                  WHEN c.is_anonymous = true THEN NULL
                  ELSE u.id
                END AS "userId",
                CASE 
                  WHEN c.is_anonymous = true THEN 'Anonimna uporabnica #' || u.id
                  ELSE u.username 
                END AS author
             FROM comments c
             JOIN users u ON u.id = c.user_id
             JOIN posts p ON p.id = c.post_id
             WHERE c.is_featured = TRUE
             ORDER BY c.created_at DESC
             LIMIT 1`
        );

        if (rows.length === 0) {
            return res.json({ comment: null, type: null });
        }

        res.json({ comment: rows[0], type: "comment" });
    } catch (err) {
        console.error("Napaka /api/comments/featured:", err);
        res.status(500).json({ error: "Napaka pri branju featured komentarja" });
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
            } catch (err) {}
        }

        const countRes = await db.query(
            "SELECT COUNT(*)::int AS count FROM comment_likes WHERE comment_id = $1",
            [id]
        );
        const likeCount = countRes.rows[0].count;

        let isLiked = false;
        if (userId) {
            const likeRes = await db.query(
                "SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
                [id, userId]
            );
            isLiked = likeRes.rowCount > 0;
        }

        res.json({
            count: likeCount,
            isLiked: isLiked
        });
    } catch (err) {
        console.error("Napaka /api/comments/:id/likes:", err);
        res.status(500).json({ error: "Napaka pri branju lajkov komentarja" });
    }
});

router.post("/:id/likes", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const check = await db.query("SELECT id FROM comments WHERE id = $1", [id]);
        if (check.rowCount === 0) {
            return res.status(404).json({ error: "Komentar ne obstaja" });
        }

        const existing = await db.query(
            "SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
            [id, userId]
        );

        if (existing.rowCount > 0) {
            await db.query(
                "DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
                [id, userId]
            );
            res.json({ action: "unliked", message: "Lajk odstranjen" });
        } else {
            await db.query(
                "INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)",
                [id, userId]
            );
            res.json({ action: "liked", message: "Komentar lajkan" });
        }
    } catch (err) {
        console.error("Napaka /api/comments/:id/likes POST:", err);
        if (err.code === '23505') {
            return res.status(409).json({ error: "Komentar je že lajkan" });
        }
        res.status(500).json({ error: "Napaka pri lajkanju komentarja" });
    }
});

router.post("/:id/replies", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { content, isAnonymous } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: "Vsebina je obvezna" });
        }

        const parentCheck = await db.query(
            "SELECT post_id FROM comments WHERE id = $1",
            [id]
        );
        if (parentCheck.rowCount === 0) {
            return res.status(404).json({ error: "Komentar ne obstaja" });
        }

        const postId = parentCheck.rows[0].post_id;

        const { rows } = await db.query(
            `INSERT INTO comments (post_id, user_id, content, is_anonymous, parent_comment_id, created_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
             RETURNING id, content, created_at AS "createdAt", is_anonymous AS "isAnonymous", parent_comment_id AS "parentCommentId"`,
            [postId, userId, content.trim(), isAnonymous || false, id]
        );

        const userRes = await db.query("SELECT username FROM users WHERE id = $1", [userId]);
        const username = userRes.rows[0]?.username || "Neznano";

        res.status(201).json({
            id: rows[0].id,
            content: rows[0].content,
            createdAt: rows[0].createdAt,
            isAnonymous: rows[0].isAnonymous,
            parentCommentId: rows[0].parentCommentId,
            user: {
                id: userId,
                username: rows[0].isAnonymous ? "Anonimen član" : username
            },
            likeCount: 0,
            isLiked: false
        });
    } catch (err) {
        console.error("Napaka /api/comments/:id/replies POST:", err);
        res.status(500).json({ error: "Napaka pri dodajanju odgovora" });
    }
});

module.exports = router;