const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const RESEND_FROM = import.meta.env.VITE_EMAIL_FROM || "onboarding@resend.dev";

if (!RESEND_API_KEY) {
  console.warn("VITE_RESEND_API_KEY is missing. Email sending will fail.");
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (data: EmailData) => {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: data.to,
        subject: data.subject,
        html: data.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send email via Resend");
    }

    const result = await response.json();
    return { ...result, messageId: result.id };
  } catch (error) {
    console.error("Resend service error:", error);
    throw error;
  }
};

export const sendScheduleEmail = async (to: string, data: {
  name: string;
  position: string;
  date: string;
  time: string;
  type: string;
  details: string;
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb;">Interview Scheduled</h2>
      <p>Hello ${data.name},</p>
      <p>Your interview for <strong>${data.position}</strong> has been scheduled.</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Type:</strong> ${data.type}</p>
        <p><strong>Details:</strong> ${data.details}</p>
      </div>
      <p>Best regards,<br/>Zira HR Team</p>
      <p>Follow this link to do the interview: <a href="https://recruit-11b6.onrender.com">https://recruit-11b6.onrender.com</a></p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Interview Scheduled for ${data.position}`,
    html,
  });
};