const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (data: EmailData) => {
  try {
    const response = await fetch(`${API_URL}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send email");
    }

    return await response.json();
  } catch (error) {
    console.error("Email service error:", error);
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