import { Resend } from "resend";

const isProduction = process.env.NODE_ENV === "production";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "temporary_later") {
    return null;
  }

  return new Resend(apiKey);
}

function getEmailFromAddress() {
  return process.env.EMAIL_FROM || "One Earth Legacy <noreply@onearthlegacy.com>";
}

function buildOtpEmailHtml(otp) {
  return `
    <div style="margin:0;padding:0;background:#0b0b0f;font-family:Inter,Arial,sans-serif;color:#f8f3e7;">
      <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
        <div style="border:1px solid rgba(212,175,55,0.35);border-radius:24px;background:#15151d;padding:28px;">
          <p style="margin:0 0 10px 0;color:#d4af37;font-size:12px;letter-spacing:3px;text-transform:uppercase;">
            One Earth Legacy
          </p>

          <h1 style="margin:0 0 16px 0;font-size:28px;line-height:1.2;color:#ffffff;">
            Your login code
          </h1>

          <p style="margin:0 0 20px 0;color:#c9c4b8;font-size:16px;line-height:1.6;">
            Use this 6-digit code to enter your legacy account. This code expires in 10 minutes and can only be used once.
          </p>

          <div style="margin:24px 0;padding:18px 20px;border-radius:18px;background:#050507;border:1px solid rgba(212,175,55,0.45);text-align:center;">
            <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#f6d76b;">
              ${otp}
            </div>
          </div>

          <p style="margin:20px 0 0 0;color:#8f8a80;font-size:13px;line-height:1.6;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </div>

        <p style="margin:18px 0 0 0;text-align:center;color:#777;font-size:12px;">
          One Earth Legacy — The world remembers those who gave.
        </p>
      </div>
    </div>
  `;
}

function buildOtpEmailText(otp) {
  return [
    "Your One Earth Legacy login code",
    "",
    `Code: ${otp}`,
    "",
    "This code expires in 10 minutes and can only be used once.",
    "If you did not request this code, you can safely ignore this email."
  ].join("\n");
}

export async function sendOtpEmail({ to, otp }) {
  const resend = getResendClient();
  const from = getEmailFromAddress();

  if (!resend) {
    if (isProduction) {
      throw new Error("RESEND_API_KEY is missing. OTP email cannot be sent in production.");
    }

    console.log(`[DEV OTP] ${to}: ${otp}`);
    return {
      devMode: true,
      message: "OTP printed to backend terminal"
    };
  }

  if (!process.env.EMAIL_FROM || process.env.EMAIL_FROM === "temporary_later") {
    if (isProduction) {
      throw new Error("EMAIL_FROM is missing. OTP email cannot be sent in production.");
    }

    console.warn("EMAIL_FROM is missing. Using local fallback sender.");
  }

  const response = await resend.emails.send({
    from,
    to,
    subject: "Your One Earth Legacy login code",
    html: buildOtpEmailHtml(otp),
    text: buildOtpEmailText(otp)
  });

  return response;
}