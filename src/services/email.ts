import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export const sendScheduleEmail = async (to: string, data: {
  name: string;
  position: string;
  date: string;
  time: string;
  type: string;
  details: string;
}) => {
  try {
    await resend.emails.send({
      from: 'noreply@zirahrapp.com', // Change this
      to,
      subject: `Interview Scheduled for ${data.position}`,
      html: `
        <p>Hello ${data.name},</p>
        <p>Your interview for <strong>${data.position}</strong> has been scheduled.</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Type:</strong> ${data.type}</p>
        <p><strong>Details:</strong> ${data.details}</p>
        <p>Best regards,<br/>Your Company</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};