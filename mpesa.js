import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortcode = process.env.MPESA_SHORTCODE; // e.g. 600123
const initiatorName = process.env.MPESA_INITIATOR;
const securityCredential = process.env.MPESA_SECURITY_CREDENTIAL; // from openssl

// Generate access token
const generateToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const res = await fetch("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: `Basic ${auth}` }
  });
  const data = await res.json();
  return data.access_token;
};

// B2C route
app.post("/api/mpesa/b2c", async (req, res) => {
  try {
    const { phoneNumber, amount, employeeNumber, fullName } = req.body;
    const token = await generateToken();

    const mpesaRes = await fetch("https://api.safaricom.co.ke/mpesa/b2c/v3/paymentrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        OriginatorConversationID: `pay-${Date.now()}`,
        InitiatorName: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: "SalaryPayment",
        Amount: amount,
        PartyA: shortcode,
        PartyB: phoneNumber,
        Remarks: `Salary advance for ${fullName}`,
        QueueTimeOutURL: "https://yourdomain.com/api/mpesa/timeout",
        ResultURL: "https://yourdomain.com/api/mpesa/result",
        Occasion: "SalaryAdvance"
      })
    });

    const data = await mpesaRes.json();
    res.json(data);
  } catch (err) {
    console.error("B2C error:", err);
    res.status(500).json({ message: "Payment failed", error: err.message });
  }
});

// Callback endpoints
app.post("/api/mpesa/result", (req, res) => {
  console.log("B2C Result:", req.body);
  res.json({ message: "Result received" });
});

app.post("/api/mpesa/timeout", (req, res) => {
  console.log("B2C Timeout:", req.body);
  res.json({ message: "Timeout received" });
});

app.listen(3001, () => console.log("Server running on port 3001"));
