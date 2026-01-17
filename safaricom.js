// server.js
import express from "express";
import cors from "cors";
import mpesaRouter from "./mpesa.js";
import emailRouter from "./email_routes.js";
import zoomRouter from "./zoom_routes.js";


const app = express();
app.use(cors());
app.use(express.json());

// Attach routes
app.use("/api/mpesa", mpesaRouter);
app.use("/api/email", emailRouter);
app.use("/api/zoom", zoomRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
