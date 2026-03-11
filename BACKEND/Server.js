require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { generalLimiter } = require("./middleware/rateLimiter");

console.log("Zaganjam server...");
console.log("PORT:", process.env.PORT || 8080);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Nastavljen ✓" : "NI NASTAVLJEN ✗");

const app = express();
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: frontendOrigin,
  credentials: true,
}));

app.use("/api", generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use("/api", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/users", require("./routes/users"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/admin", require("./routes/admin"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Neobravnavana napaka:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Neobravnavana izjema:', error);
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server posluša na http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} je že zaseden!`);
    console.error('Rešitve:');
    console.error('  1. Ustavi drugi strežnik na tem portu');
    console.error('  2. Ali spremeni PORT v .env datoteki');
    console.error('');
    console.error('Za iskanje procesa na portu 8080 zaženite:');
    console.error('  netstat -ano | findstr :8080');
  } else {
    console.error('Napaka pri zagonu strežnika:', err);
  }
  process.exit(1);
});