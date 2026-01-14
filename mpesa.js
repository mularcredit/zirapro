import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.post("/api/mpesa/result", async (req, res) => {
  console.log("B2C Result:", req.body);

  try {
    const result = req.body.Result;

    if (result && result.ResultParameters) {
      const params = {};
      result.ResultParameters.ResultParameter.forEach(p => {
        params[p.Key] = p.Value;
      });

      const transactionId = result.TransactionID;
      const conversationId = result.ConversationID;
      const employeeNumber = params["ReceiverPartyPublicName"]?.split(" - ")[0] || null;

      // Update Supabase record
      if (employeeNumber) {
        const { error } = await supabase
          .from("salary_advance")
          .update({
            status: "Paid",
            mpesa_conversation_id: conversationId,
            mpesa_transaction_id: transactionId,
            mpesa_result_desc: result.ResultDesc
          })
          .eq("Employee Number", employeeNumber);

        if (error) {
          console.error("Supabase update error:", error);
        }
      }
    }

    res.json({ message: "Result received" });
  } catch (err) {
    console.error("Error processing result:", err);
    res.status(500).json({ message: "Failed to process result" });
  }
});
