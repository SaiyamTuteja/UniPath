const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendPasswordResetEmail = async (toEmail, resetToken, userName) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"UniPath GEHU" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'UniPath Password Reset Request',
    html: `
      <div style="font-family: 'Space Grotesk', sans-serif; background:#0A0F1E; color:#F9FAFB; padding:40px; border-radius:12px;">
        <h1 style="color:#06B6D4;">UniPath 🗺️</h1>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>You requested a password reset. Click below to reset your password:</p>
        <a href="${resetUrl}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Reset Password
        </a>
        <p style="color:#6B7280;margin-top:24px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        <p style="color:#6B7280;">— UniPath, GEHU Dehradun</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };
