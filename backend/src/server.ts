import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root folder
dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Validate env vars
const requiredEnvVars = ["ZOOM_SDK_KEY", "ZOOM_SDK_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.warn("⚠️ Missing Zoom environment variables:", missingEnvVars.join(", "));
  console.warn("Zoom signature generation will not work, but other services remain active.");
}

interface GenerateSignatureRequest {
  sessionName: string;
  userIdentity: string;
  role?: number;
}

app.post("/api/zoom/signature", (req, res) => {
  try {
    const { sessionName, userIdentity, role = 0 }: GenerateSignatureRequest = req.body;

    if (!sessionName || !userIdentity) {
      return res.status(400).json({ error: "sessionName and userIdentity are required" });
    }

    const sdkKey = process.env.ZOOM_SDK_KEY!;
    const sdkSecret = process.env.ZOOM_SDK_SECRET!;
    const expirationHours = parseInt(process.env.JWT_EXPIRATION_HOURS || "24", 10);

    // ✅ Zoom Video SDK JWT payload
    const payload = {
      app_key: sdkKey,
      topic: sessionName, // topic/session name
      version: 1,
      user_identity: userIdentity,
      role_type: role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * expirationHours,
    };

    const signature = jwt.sign(payload, sdkSecret, { algorithm: "HS256" });

    res.json({
      signature,
      sdkKey,
      sessionName,
      userIdentity,
      role,
      expiresIn: expirationHours * 60 * 60,
    });

    console.log(`✅ Generated signature for ${sessionName} (${userIdentity})`);
  } catch (err) {
    console.error("❌ Error generating signature:", err);
    res.status(500).json({ error: "Failed to generate JWT signature" });
  }
});

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
app.post("/api/email/send", async (req, res) => {
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

    console.log("✅ Message sent: %s", info.messageId);
    res.json({ message: "Email sent successfully", messageId: info.messageId });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      port: PORT,
      hasZoomConfig: !!(process.env.ZOOM_SDK_KEY && process.env.ZOOM_SDK_SECRET),
    },
  });
});

// 404 handler
app.all("*", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
