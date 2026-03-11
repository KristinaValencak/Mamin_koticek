const requireAuth = require("./auth");
const db = require("../config/database");

async function requireAdmin(req, res, next) {
    requireAuth(req, res, async () => {
        try {
            const { rows } = await db.query(
                "SELECT is_admin FROM users WHERE id = $1",
                [req.user.id]
            );

            if (rows.length === 0 || !rows[0].is_admin) {
                return res.status(403).json({ error: "Nimate admin dovoljenj" });
            }

            next();
        } catch (err) {
            console.error("Napaka pri preverjanju admin dovoljenj:", err);
            return res.status(500).json({ error: "Napaka pri preverjanju dovoljenj" });
        }
    });
}

module.exports = requireAdmin;