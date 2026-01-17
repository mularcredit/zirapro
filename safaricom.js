// server.js
import express from "express";
import cors from "cors";
import mpesaRouter from "./mpesa.js";


const app = express();
app.use(cors());
app.use(express.json());

// Attach Mpesa routes under /api/mpesa
app.use("/api/mpesa", mpesaRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
