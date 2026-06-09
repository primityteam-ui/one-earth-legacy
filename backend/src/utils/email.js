import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOtpEmail({ to, otp }) {
  if (!resend) {
    console.log(`[DEV OTP] ${to}: ${otp}`);
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your One Earth Legacy login code",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #111; line-height: 1.6;">
        <h2>Your Emperor of Earth login code</h2>
        <p>Use this 6-digit code to continue:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
        <p>This code expires in 10 minutes and can only be used once.</p>
      </div>
    `
  });
}