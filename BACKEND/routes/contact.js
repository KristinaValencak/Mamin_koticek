const express = require("express");
const router = express.Router();
const emailService = require("../services/emailService");

router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Ime je obvezno." });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Email je obvezen." });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Neveljaven email naslov." });
        }
        if (!subject || !subject.trim()) {
            return res.status(400).json({ error: "Zadeva je obvezna." });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ error: "Sporočilo je obvezno." });
        }

        await emailService.sendContactEmail(
            name.trim(),
            email.trim(),
            subject.trim(),
            message.trim()
        );

        res.status(200).json({ message: "Sporočilo uspešno poslano." });
    } catch (err) {
        console.error("Napaka pri pošiljanju kontaktnega sporočila:", err);
        res.status(500).json({ error: "Napaka pri pošiljanju sporočila." });
    }
});

module.exports = router;