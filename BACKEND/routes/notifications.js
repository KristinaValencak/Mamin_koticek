const express = require("express");
const router = express.Router();
const db = require("../config/database");
const requireAuth = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
        const offset = parseInt(req.query.offset || "0", 10);

        const { rows } = await db.query(
            `SELECT 
          n.id,
          n.type,
          n.read,
          n.created_at AS "createdAt",
          n.post_id AS "postId",
          p.title AS "postTitle",
          u.id AS "actorId",
          u.username AS "actorUsername"
        FROM notifications n
        JOIN posts p ON p.id = n.post_id
        JOIN users u ON u.id = n.actor_id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countRes = await db.query(
            `SELECT 
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE read = false)::int AS unread
            FROM notifications
            WHERE user_id = $1`,
            [userId]
        );

        res.json({
            items: rows,
            pagination: {
                limit,
                offset,
                total: countRes.rows[0].total
            },
            unreadCount: countRes.rows[0].unread
        });
    } catch (err) {
        console.error("Napaka /api/notifications:", err);
        res.status(500).json({ error: "Napaka pri branju notifikacij" });
    }
});

router.put("/:id/read", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { rows } = await db.query(
            `UPDATE notifications 
         SET read = true 
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
            [id, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Notifikacija ne obstaja" });
        }

        res.json({ message: "Notifikacija označena kot prebrana" });
    } catch (err) {
        console.error("Napaka /api/notifications/:id/read:", err);
        res.status(500).json({ error: "Napaka pri označevanju notifikacije" });
    }
});

router.put("/read-all", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        await db.query(
            `UPDATE notifications 
         SET read = true 
         WHERE user_id = $1 AND read = false`,
            [userId]
        );

        res.json({ message: "Vse notifikacije označene kot prebrane" });
    } catch (err) {
        console.error("Napaka /api/notifications/read-all:", err);
        res.status(500).json({ error: "Napaka pri označevanju notifikacij" });
    }
});

module.exports = router;