import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
  console.error("❌ Missing required environment variables:", missingEnvVars.join(", "));
  process.exit(1);
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
