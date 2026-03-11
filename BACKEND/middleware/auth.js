const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    const token = req.cookies.token || (req.headers["authorization"]?.split(" ")[1]);

    if (!token) {
        return res.status(401).json({ error: "Manjka token" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Neveljaven ali potekel token" });
    }
}

module.exports = requireAuth;