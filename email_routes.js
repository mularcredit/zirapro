import express from "express";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Resend if API key is present
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Fallback Nodemailer Transporter configuration
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

        // Use Resend if available
        if (resend) {
            const { data, error } = await resend.emails.send({
                from: process.env.SMTP_FROM || "onboarding@resend.dev",
                to,
                subject,
                html,
            });

            if (error) {
                console.error("❌ Resend error:", error);
                throw error;
            }

            console.log("✅ Email sent via Resend: %s", data.id);
            return res.json({ message: "Email sent successfully", id: data.id });
        }

        // Fallback to Nodemailer
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Zira HR" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log("✅ Email sent via SMTP: %s", info.messageId);
        res.json({ message: "Email sent successfully", id: info.messageId });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

export default router;
