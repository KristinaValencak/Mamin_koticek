const { Pool } = require("pg");

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: false,
});

(async () => {
    try {
        await db.query("SELECT 1");
        console.log("Povezano na PostgreSQL ✔️");
    } catch (e) {
        console.error("Ne morem se povezati ❌", e);
    }
})();

module.exports = db;