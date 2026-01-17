// email_routes.js
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Nodemailer Transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Email sending endpoint
router.post("/send", async (req, res) => {
    try {
        const { to, subject, html } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ error: "to, subject, and html are required" });
        }

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Zira HR" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log("✅ Email sent: %s", info.messageId);
        res.json({ message: "Email sent successfully", messageId: info.messageId });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

export default router;
