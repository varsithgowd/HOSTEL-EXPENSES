import nodemailer from 'nodemailer';

/**
 * Creates and returns a configured Nodemailer transporter
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587 or other
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
};

/**
 * Sends a password reset email to the student
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - Student's full name
 * @param {string} options.resetUrl - Full password reset URL with token
 */
export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const from = process.env.EMAIL_FROM || 'Hostel Expense Tracker <no-reply@hostelexpenses.com>';
  const transporter = createTransporter();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0B0B12;
      color: #F8FAFC;
    }
    .wrapper {
      width: 100%;
      background-color: #0B0B12;
      padding: 40px 10px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #171725;
      border: 1px solid #232338;
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      padding: 30px;
      text-align: center;
      background: linear-gradient(135deg, #1e1136 0%, #171725 100%);
      border-bottom: 1px solid #232338;
    }
    .logo {
      font-size: 20px;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: -0.5px;
    }
    .logo-accent {
      color: #8B5CF6;
    }
    .content {
      padding: 32px 30px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
      color: #F8FAFC;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #94A3B8;
      margin: 0 0 16px 0;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #8B5CF6;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      padding: 13px 32px;
      border-radius: 12px;
      letter-spacing: 0.2px;
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
    }
    .notice {
      background-color: #11111B;
      border: 1px solid #232338;
      border-left: 4px solid #F59E0B;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 24px 0;
    }
    .notice p {
      font-size: 12px;
      margin: 0;
      color: #F8FAFC;
    }
    .notice-subtitle {
      color: #94A3B8 !important;
      margin-top: 4px !important;
    }
    .footer {
      padding: 20px 30px;
      text-align: center;
      background-color: #11111B;
      border-top: 1px solid #232338;
      font-size: 11px;
      color: #64748B;
    }
    .link-fallback {
      word-break: break-all;
      color: #8B5CF6;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">Hostel<span class="logo-accent">Expense</span></div>
        <p style="font-size: 11px; color: #94A3B8; margin-top: 4px; margin-bottom: 0;">Student Finance Management System</p>
      </div>
      
      <div class="content">
        <h1>Password Reset Request</h1>
        <p>Hello ${name || 'Hostel Student'},</p>
        <p>We received a request to reset your password for your <strong>Hostel Expense Tracker</strong> account. Click the button below to choose a new password:</p>
        
        <div class="btn-container">
          <a href="${resetUrl}" target="_blank" class="btn">Reset My Password</a>
        </div>
        
        <div class="notice">
          <p>⏳ <strong>This link is valid for 15 minutes only.</strong></p>
          <p class="notice-subtitle">For your account security, this link can only be used once and expires automatically.</p>
        </div>
        
        <p style="font-size: 12px; color: #64748B;">If you didn't request a password reset, you can safely ignore this email. Your current password remains active and secure.</p>
        
        <p style="font-size: 11px; color: #64748B; margin-top: 24px; border-top: 1px solid #232338; padding-top: 16px;">
          If the button above does not work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" class="link-fallback">${resetUrl}</a>
        </p>
      </div>
      
      <div class="footer">
        © ${new Date().getFullYear()} Hostel Expense Tracker. All rights reserved.<br>
        Built for College & Hostel Students.
      </div>
    </div>
  </div>
</body>
</html>
`;

  const textContent = `
Hostel Expense Tracker — Password Reset Request

Hello ${name || 'Hostel Student'},

We received a request to reset your password for your Hostel Expense Tracker account.
Please visit the link below to set a new password (valid for 15 minutes):

${resetUrl}

If you did not request this password reset, please ignore this email. Your password will remain unchanged.
`;

  // If transporter is configured, send the actual email
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject: 'Reset Your Password — Hostel Expense Tracker',
        text: textContent,
        html: htmlContent,
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EmailService] Error sending email via SMTP:', err);
      throw err;
    }
  }

  // Fallback for development, testing, or unconfigured SMTP
  console.log('----------------------------------------------------');
  console.log('[EmailService] SMTP not configured. Password Reset Link:');
  console.log(`To: ${to}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('----------------------------------------------------');

  return { success: true, simulated: true, resetUrl };
};
