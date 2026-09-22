const nodemailer = require("nodemailer");
require("dotenv").config();

// Create reusable transporter object using SMTP transport
function createTransporter() {
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  if (!user || !pass) {
    return null;
  }

  // Use service: 'gmail' for Gmail accounts for best connection reliability
  if (user.endsWith("@gmail.com") || (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes("gmail"))) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Send Welcome Email to a newly registered user (both standard and Google OAuth)
 */
async function sendWelcomeEmail(toEmail, userName = "Student", provider = "Email") {
  const transporter = createTransporter();
  const subject = "Welcome to Task Manager";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Task Manager</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 28px;">
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Welcome, ${userName}!</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Thank you for creating an account via <strong>${provider === "google" ? "Google" : "Email"}</strong>. Your personal task manager workspace and private activity logs have been initialized.
    </p>
    <div style="background: #f1f5f9; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 13.5px; color: #475569;">
      <strong>Getting Started:</strong>
      <ul style="margin: 8px 0 0; padding-left: 18px; line-height: 1.5;">
        <li>Create tasks that automatically start in <em>Incomplete</em> status.</li>
        <li>Track your progress by transitioning to <em>Ongoing</em> and <em>Complete</em>.</li>
        <li>Download PDF activity summaries anytime.</li>
      </ul>
    </div>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
      If you did not sign up for this account, please disregard this email.
    </p>
  </div>
</body>
</html>`;

  if (!transporter) {
    console.log("--------------------------------------------------");
    console.log(`📧 [EMAIL NOTICE] SMTP credentials not set in .env.`);
    console.log(` simulated Welcome email to: ${toEmail} (${userName})`);
    console.log("--------------------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    const text = `Hi ${userName},\n\nThank you for creating your account via ${provider === "google" ? "Google" : "Email"}.\nYour personal workspace and activity logs are ready.\n\nTask Manager Portfolio`;
    const info = await transporter.sendMail({
      from: `"Jay Patel" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      text,
      html,
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
      },
    });
    console.log(`✉️ Welcome email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`⚠️ Failed to send welcome email to ${toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Password Reset OTP Email
 */
async function sendOtpEmail(toEmail, userName = "User", otp) {
  const transporter = createTransporter();
  const subject = `Task Manager code: ${otp}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
    <p style="font-size: 15px; margin-top: 0;">Hi ${userName},</p>
    <p style="font-size: 14px; line-height: 1.5; color: #334155;">
      Here is your requested code for your Task Manager portfolio account:
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; color: #0f172a; font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 8px 24px; border-radius: 6px;">
        ${otp}
      </span>
      <p style="font-size: 12px; color: #64748b; margin-top: 6px;">Expires in 10 minutes</p>
    </div>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
      Best regards,<br/>
      Jay Patel
    </p>
  </div>
</body>
</html>`;

  if (!transporter) {
    console.log("==================================================");
    console.log(`🔐 [SIMULATED OTP] Password Reset for: ${toEmail}`);
    console.log(`👉 YOUR 6-DIGIT OTP CODE IS: [ ${otp} ]`);
    console.log(`⚠️ Valid for 10 minutes. Configure EMAIL_USER and EMAIL_PASS in .env to send real emails.`);
    console.log("==================================================");
    return { success: true, simulated: true, otp };
  }

  try {
    const text = `Hi ${userName},\n\nHere is your requested code for your Task Manager account: ${otp}\nThis code is valid for 10 minutes.\n\nBest regards,\nJay Patel`;
    const info = await transporter.sendMail({
      from: `"Jay Patel" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      text,
      html,
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
      },
    });
    console.log(`✉️ Password reset OTP sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`⚠️ Failed to send OTP email to ${toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Contact Form Message directly to Portfolio Owner (Jay Patel)
 * Includes sender's name and contact email so Jay can reply back to them
 */
async function sendContactFormEmails({ name, email, message }) {
  const transporter = createTransporter();
  const receiverEmail = process.env.EMAIL_USER || "jayyypatelll333@gmail.com";

  if (!transporter) {
    console.log("==================================================");
    console.log(`📬 [SIMULATED CONTACT MESSAGE TO JAY]`);
    console.log(`From Visitor: ${name} <${email}>`);
    console.log(`To: ${receiverEmail}`);
    console.log(`Message: ${message}`);
    console.log("==================================================");
    return { success: true, simulated: true };
  }

  try {
    const ownerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>New Portfolio Message</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 18px;">📬 New Message from Portfolio</h3>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
      <p style="font-size: 14px; margin: 0 0 6px; color: #334155;"><strong>Sender Name:</strong> ${name}</p>
      <p style="font-size: 14px; margin: 0; color: #334155;"><strong>Contact Email:</strong> <a href="mailto:${email}" style="color: #2563eb; font-weight: 600;">${email}</a></p>
    </div>
    <p style="font-size: 14px; font-weight: 600; color: #0f172a; margin: 0 0 6px;">Message:</p>
    <div style="background: #f1f5f9; padding: 14px; border-radius: 6px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #1e293b;">
${message}
    </div>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
      Tip: You can hit Reply or click the email above to contact ${name} directly at ${email}.
    </p>
  </div>
</body>
</html>`;

    const ownerText = `New Portfolio Message\n\nSender Name: ${name}\nContact Email: ${email}\n\nMessage:\n${message}\n\nYou can reply directly to: ${email}`;

    const info = await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: receiverEmail,
      replyTo: email,
      subject: `New Message from ${name} (${email})`,
      text: ownerText,
      html: ownerHtml,
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
      },
    });

    console.log(`✉️ Contact message from ${name} (${email}) delivered directly to Jay (${receiverEmail}): ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("⚠️ Failed to deliver contact email:", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendOtpEmail,
  sendContactFormEmails,
};
