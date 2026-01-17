// zoom_routes.js
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/signature", (req, res) => {
    try {
        const { sessionName, userIdentity, role = 0 } = req.body;

        if (!sessionName || !userIdentity) {
            return res.status(400).json({ error: "sessionName and userIdentity are required" });
        }

        const sdkKey = process.env.ZOOM_SDK_KEY;
        const sdkSecret = process.env.ZOOM_SDK_SECRET;
        const expirationHours = parseInt(process.env.JWT_EXPIRATION_HOURS || "24", 10);

        if (!sdkKey || !sdkSecret) {
            return res.status(500).json({ error: "Zoom configuration missing" });
        }

        const payload = {
            app_key: sdkKey,
            topic: sessionName,
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
    } catch (err) {
        console.error("❌ Error generating Zoom signature:", err);
        res.status(500).json({ error: "Failed to generate JWT signature" });
    }
});

export default router;
