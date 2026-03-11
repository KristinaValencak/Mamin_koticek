const express = require("express");
const router = express.Router();
const db = require("../config/database");
const requireAuth = require("../middleware/auth");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const emailService = require("../services/emailService");

router.get("/me", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            "SELECT id, username, email, email_verified, bio, is_admin FROM users WHERE id = $1",
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Uporabnik ne obstaja" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Napaka /api/users/me:", err);
        res.status(500).json({ error: "Napaka pri branju profila" });
    }
});

router.put("/me", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, password, bio } = req.body;

        if (username || email) {
            const check = await db.query(
                "SELECT id FROM users WHERE (lower(email) = lower($1) OR lower(username) = lower($2)) AND id != $3",
                [email || "", username || "", userId]
            );
            if (check.rowCount > 0) {
                return res.status(409).json({ message: "Uporabnik z emailom ali uporabniškim imenom že obstaja." });
            }
        }

        let updateFields = [];
        let values = [];
        let paramIndex = 1;

        if (username) {
            updateFields.push(`username = $${paramIndex}`);
            values.push(username.trim());
            paramIndex++;
        }

        let emailChanged = false;
        let newEmail = null;
        let verificationToken = null;
        let tokenExpires = null;

        if (email) {
            const currentUser = await db.query(
                "SELECT email FROM users WHERE id = $1",
                [userId]
            );

            if (currentUser.rows[0].email.toLowerCase() !== email.toLowerCase()) {
                emailChanged = true;
                newEmail = email.trim();

                verificationToken = crypto.randomBytes(32).toString('hex');
                tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

                console.log("=== SPREMEMBA EMAILA ===");
                console.log("User ID:", userId);
                console.log("Stari email:", currentUser.rows[0].email);
                console.log("Nov email:", newEmail);
                updateFields.push(`email = $${paramIndex}`);
                values.push(newEmail);
                paramIndex++;

                updateFields.push(`email_verified = $${paramIndex}`);
                values.push(false);
                paramIndex++;

                updateFields.push(`verification_token = $${paramIndex}`);
                values.push(verificationToken);
                paramIndex++;

                updateFields.push(`verification_token_expires = $${paramIndex}`);
                values.push(tokenExpires);
                paramIndex++;
            }
        }

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ message: "Geslo mora biti vsaj 8 znakov dolgo." });
            }
            const hash = await bcrypt.hash(password, 12);
            updateFields.push(`password_hash = $${paramIndex}`);
            values.push(hash);
            paramIndex++;
        }

        if (bio !== undefined) {
            updateFields.push(`bio = $${paramIndex}`);
            values.push(bio ? bio.trim() : null);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "Ni podatkov za posodobitev." });
        }

        values.push(userId);
        const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING id, username, email, email_verified, bio, is_admin`;
        const { rows } = await db.query(query, values);

        if (emailChanged && verificationToken) {
            try {
                await emailService.sendVerificationEmail(newEmail, username || rows[0].username, verificationToken);
            } catch (emailError) {
                console.error("❌ Napaka pri pošiljanju emaila:", emailError);
            }
        }

        const response = {
            ...rows[0],
            emailChanged: emailChanged,
            message: emailChanged
                ? "Profil posodobljen. Preveri svoj nov email za verifikacijsko povezavo."
                : "Profil uspešno posodobljen."
        };

        res.json(response);
    } catch (err) {
        console.error("Napaka /api/users/me PUT:", err);
        res.status(500).json({ error: "Napaka pri posodabljanju profila" });
    }
});

router.delete("/me", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ error: "Uporabnik ne obstaja" });
        }

        await db.query("DELETE FROM notifications WHERE user_id = $1 OR actor_id = $1", [userId]);
        await db.query("DELETE FROM post_likes WHERE user_id = $1", [userId]);
        await db.query("DELETE FROM comments WHERE user_id = $1", [userId]);
        await db.query("DELETE FROM posts WHERE user_id = $1", [userId]);
        await db.query("DELETE FROM users WHERE id = $1", [userId]);

        res.json({ message: "Račun uspešno izbrisan" });
    } catch (err) {
        console.error("Napaka /api/users/me DELETE:", err);
        res.status(500).json({ error: "Napaka pri brisanju računa" });
    }
});

router.get("/me/posts", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
        const offset = parseInt(req.query.offset || "0", 10);

        const { rows } = await db.query(
            `SELECT p.id,
                p.title,
                p.content,
                p.created_at AS "createdAt",
                c.name        AS "categoryName",
                c.slug        AS "categorySlug",
                COALESCE(like_counts.like_count, 0) AS "likeCount",
                COALESCE(comment_counts.comment_count, 0) AS "commentCount"
         FROM posts p
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN (
           SELECT post_id, COUNT(*)::int AS like_count
           FROM post_likes
           GROUP BY post_id
         ) like_counts ON like_counts.post_id = p.id
         LEFT JOIN (
           SELECT post_id, COUNT(*)::int AS comment_count
           FROM comments
           GROUP BY post_id
         ) comment_counts ON comment_counts.post_id = p.id
         WHERE p.user_id = $1
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countRes = await db.query(
            "SELECT COUNT(*)::int AS count FROM posts WHERE user_id = $1",
            [userId]
        );

        res.json({
            items: rows,
            pagination: {
                limit,
                offset,
                total: countRes.rows[0].count
            }
        });
    } catch (err) {
        console.error("Napaka /api/users/me/posts:", err);
        res.status(500).json({ error: "Napaka pri branju objav" });
    }
});

router.get("/me/likes", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
        const offset = parseInt(req.query.offset || "0", 10);

        const { rows } = await db.query(
            `SELECT 
          pl.id AS "likeId",
          pl.created_at AS "likedAt",
          u.username,
          p.id AS "postId",
          p.title AS "postTitle"
        FROM post_likes pl
        JOIN posts p ON p.id = pl.post_id
        JOIN users u ON u.id = pl.user_id
        WHERE p.user_id = $1
        ORDER BY pl.created_at DESC
        LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countRes = await db.query(
            `SELECT COUNT(*)::int AS count
            FROM post_likes pl
            JOIN posts p ON p.id = pl.post_id
            WHERE p.user_id = $1`,
            [userId]
        );

        res.json({
            items: rows,
            pagination: {
                limit,
                offset,
                total: countRes.rows[0].count
            }
        });
    } catch (err) {
        console.error("Napaka /api/users/me/likes:", err);
        res.status(500).json({ error: "Napaka pri branju lajkov" });
    }
});

router.get("/me/comments", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
        const offset = parseInt(req.query.offset || "0", 10);

        const { rows } = await db.query(
            `SELECT 
          c.id AS "commentId",
          c.content,
          c.created_at AS "commentedAt",
          u.username AS "commenterUsername",
          p.id AS "postId",
          p.title AS "postTitle"
        FROM comments c
        JOIN posts p ON p.id = c.post_id
        JOIN users u ON u.id = c.user_id
        WHERE p.user_id = $1
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countRes = await db.query(
            `SELECT COUNT(*)::int AS count
            FROM comments c
            JOIN posts p ON p.id = c.post_id
            WHERE p.user_id = $1`,
            [userId]
        );

        res.json({
            items: rows,
            pagination: {
                limit,
                offset,
                total: countRes.rows[0].count
            }
        });
    } catch (err) {
        console.error("Napaka /api/users/me/comments:", err);
        res.status(500).json({ error: "Napaka pri branju komentarjev" });
    }
});

router.get("/search", async (req, res) => {
    try {
        const query = req.query.q || "";
        if (!query.trim()) {
            return res.json([]);
        }

        const searchTerm = `%${query.trim().toLowerCase()}%`;
        const { rows } = await db.query(
            `SELECT id, username, email_verified, bio, created_at
             FROM users
             WHERE LOWER(username) LIKE $1
             ORDER BY username ASC
             LIMIT 20`,
            [searchTerm]
        );

        res.json(rows.map(u => ({
            id: u.id,
            username: u.username,
            email_verified: u.email_verified,
            bio: u.bio,
            created_at: u.created_at
        })));
    } catch (err) {
        console.error("Napaka /api/users/search:", err);
        res.status(500).json({ error: "Napaka pri iskanju uporabnikov" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Neveljaven ID uporabnika" });
        }

        const { rows: userRows } = await db.query(
            "SELECT id, username, email_verified, bio, created_at FROM users WHERE id = $1",
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: "Uporabnik ne obstaja" });
        }

        const user = userRows[0];

        const { rows: statsRows } = await db.query(
            `SELECT 
            COUNT(DISTINCT p.id)::int AS "totalPosts",
            COUNT(DISTINCT pl.id)::int AS "totalLikes",
            COUNT(DISTINCT c.id)::int AS "totalComments"
            FROM users u
            LEFT JOIN posts p ON p.user_id = u.id
            LEFT JOIN post_likes pl ON pl.post_id = p.id
            LEFT JOIN comments c ON c.user_id = u.id
            WHERE u.id = $1`,
            [userId]
        );

        const { rows: postsRows } = await db.query(
            `SELECT p.id, p.title, p.content, p.created_at AS "createdAt",
                    c.name AS "categoryName", c.slug AS "categorySlug",
                    COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id), 0) AS "likeCount",
                    COALESCE((SELECT COUNT(*) FROM comments WHERE post_id = p.id), 0) AS "commentCount"
             FROM posts p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC
             LIMIT 10`,
            [userId]
        );

        res.json({
            id: user.id,
            username: user.username,
            email_verified: user.email_verified,
            bio: user.bio,
            createdAt: user.created_at,
            stats: {
                totalPosts: parseInt(statsRows[0].totalPosts),
                totalLikes: parseInt(statsRows[0].totalLikes),
                totalComments: parseInt(statsRows[0].totalComments)
            },
            recentPosts: postsRows
        });
    } catch (err) {
        console.error("Napaka /api/users/:id:", err);
        res.status(500).json({ error: "Napaka pri branju profila" });
    }
});

module.exports = router;