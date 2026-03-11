const express = require("express");
const router = express.Router();
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../services/emailService");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, async (req, res) => {
    try {
        const { username, email, password, privacyPolicyAccepted } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Manjkajo podatki." });
        }

        if (!privacyPolicyAccepted) {
            return res.status(400).json({ message: "Sprejeti moraš politiko zasebnosti." });
        }

        const check = await db.query(
            "SELECT id FROM users WHERE lower(email) = lower($1) OR lower(username) = lower($2)",
            [email, username]
        );
        if (check.rowCount > 0) {
            return res.status(409).json({ message: "Uporabnik z emailom ali uporabniškim imenom že obstaja." });
        }

        const hash = await bcrypt.hash(password, 12);

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const result = await db.query(
            `INSERT INTO users (username, email, password_hash, email_verified, verification_token, verification_token_expires, privacy_policy_accepted, privacy_policy_accepted_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
         RETURNING id, username, email, email_verified`,
            [username, email, hash, false, verificationToken, tokenExpires, privacyPolicyAccepted]
        );

        const user = result.rows[0];

        try {
            await emailService.sendVerificationEmail(user.email, user.username, verificationToken);
        } catch (emailError) {
            console.error("Error sending verification email:", emailError);
        }

        return res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            emailVerified: user.email_verified,
            message: "Registracija uspešna! Preveri svoj email za verifikacijsko povezavo."
        });
    } catch (err) {
        console.error("Napaka pri registraciji:", err);
        return res.status(500).json({ message: "Strežniška napaka." });
    }
});


router.post("/login", authLimiter, async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ message: "Manjkajo podatki." });
        }

        const q = `
        SELECT id, username, email, password_hash, email_verified, is_admin
        FROM users
        WHERE lower(email) = lower($1) OR lower(username) = lower($1)
        LIMIT 1
      `;
        const r = await db.query(q, [identifier]);
        if (r.rowCount === 0) {
            return res.status(401).json({ message: "Napačni prijavni podatki." });
        }

        const user = r.rows[0];
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({ message: "Napačni prijavni podatki." });
        }

        if (!user.email_verified) {
            return res.status(403).json({
                message: "Email še ni verificiran. Preveri svoj email za verifikacijsko povezavo.",
                emailVerified: false,
                email: user.email
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET ni definiran!");
            return res.status(500).json({ message: "Napaka v konfiguraciji." });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000
        });

        return res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.is_admin
        });
    } catch (err) {
        console.error("Napaka pri prijavi:", err);
        return res.status(500).json({ message: "Strežniška napaka." });
    }
});

router.get("/verify-email", async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: "Manjka verifikacijski token." });
        }

        const result = await db.query(
            `SELECT id, username, email, verification_token, verification_token_expires 
         FROM users 
         WHERE verification_token = $1 AND email_verified = false`,
            [token]
        );

        if (result.rowCount === 0) {
            const verifiedCheck = await db.query(
                `SELECT id, username, email, email_verified 
           FROM users 
           WHERE email_verified = true 
           ORDER BY id DESC LIMIT 1`
            );

            if (verifiedCheck.rowCount > 0) {
                return res.status(400).json({
                    message: "Ta povezava je že bila uporabljena. Tvoj email je že verificiran. Prijavi se!",
                    alreadyVerified: true
                });
            }

            return res.status(400).json({ message: "Neveljaven ali že uporabljen verifikacijski token." });
        }

        const user = result.rows[0];

        if (new Date() > new Date(user.verification_token_expires)) {
            return res.status(400).json({ message: "Verifikacijski token je potekel. Prosim registriraj se ponovno." });
        }

        await db.query(
            `UPDATE users 
         SET email_verified = true, verification_token = NULL, verification_token_expires = NULL 
         WHERE id = $1`,
            [user.id]
        );

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET ni definiran!");
            return res.status(500).json({ message: "Napaka v konfiguraciji." });
        }

        const jwtToken = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
        );

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000
        });

        const userWithAdmin = await db.query(
            "SELECT is_admin FROM users WHERE id = $1",
            [user.id]
        );

        return res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: userWithAdmin.rows[0]?.is_admin || false,
            message: "Email uspešno verificiran!"
        });
    } catch (err) {
        console.error("❌ Napaka pri verifikaciji emaila:", err);
        return res.status(500).json({ message: "Strežniška napaka." });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    return res.json({ message: "Uspešna odjava" });
});

router.post("/resend-verification", authLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email je obvezen." });
        }

        const result = await db.query(
            "SELECT id, username, email, email_verified FROM users WHERE lower(email) = lower($1)",
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Uporabnik s tem emailom ne obstaja." });
        }

        const user = result.rows[0];

        if (user.email_verified) {
            return res.status(400).json({ message: "Email je že verificiran." });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.query(
            "UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3",
            [verificationToken, tokenExpires, user.id]
        );

        await emailService.sendVerificationEmail(user.email, user.username, verificationToken);

        return res.json({ message: "Verifikacijski email je bil ponovno poslan." });
    } catch (err) {
        console.error("Napaka pri ponovnem pošiljanju emaila:", err);
        return res.status(500).json({ message: "Strežniška napaka." });
    }
});

router.post("/forgot-password", authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email je obvezen." });
        }

        const { rows } = await db.query(
            "SELECT id, username, email FROM users WHERE lower(email) = lower($1)",
            [email]
        );

        if (rows.length === 0) {
            return res.status(200).json({
                message: "Če email obstaja v naši bazi, poslali bomo navodila za ponastavitev gesla."
            });
        }

        const user = rows[0];

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 60 * 60 * 1000);

        await db.query(
            "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
            [resetToken, tokenExpires, user.id]
        );

        try {
            await emailService.sendPasswordResetEmail(user.email, user.username, resetToken);
        } catch (emailError) {
            console.error("Error sending password reset email:", emailError);
        }

        return res.status(200).json({
            message: "Če email obstaja v naši bazi, poslali bomo navodila za ponastavitev gesla."
        });
    } catch (err) {
        console.error("Napaka pri forgot-password:", err);
        return res.status(500).json({ message: "Strežniška napaka." });
    }
});

router.post("/reset-password", authLimiter, async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ message: "Token in geslo sta obvezna." });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Geslo mora biti vsaj 8 znakov dolgo." });
        }

        const { rows } = await db.query(
            `SELECT id, reset_token_expires 
         FROM users 
         WHERE reset_token = $1 AND reset_token_expires > NOW()`,
            [token]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                message: "Token je neveljaven ali je potekel. Prosim zahtevaj nov link za ponastavitev gesla."
            });
        }

        const userId = rows[0].id;

        const hash = await bcrypt.hash(password, 12);

        await db.query(
            `UPDATE users 
         SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL 
         WHERE id = $2`,
            [hash, userId]
        );

        return res.status(200).json({
            message: "Geslo uspešno ponastavljeno. Sedaj se lahko prijaviš z novim geslom."
        });
    } catch (err) {
        console.error("Napaka pri reset-password:", err);
        return res.status(500).json({ message: "Strežniška napaka." });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    return res.json({ message: "Uspešna odjava" });
});

module.exports = router;