const logger = require("../utils/logger");

async function sendVerificationEmail(to, verificationLink) {
  try {
    const apiKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
    const fromName = process.env.MAILERSEND_FROM_NAME || "Todoist";

    if (!apiKey || !fromEmail) {
      throw new Error(
        "Missing MAILERSEND_API_KEY or MAILERSEND_FROM_EMAIL environment variable",
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Email Verification</h2>
        <p>Thanks for signing up.</p>
        <p>Click the button below to verify your email:</p>

        <a href="${verificationLink}"
           style="
             display: inline-block;
             padding: 10px 20px;
             background-color: #2563eb;
             color: #ffffff;
             text-decoration: none;
             border-radius: 5px;
           ">
          Verify Email
        </a>

        <p style="margin-top: 20px;">
          If you did not create this account, you can ignore this email.
        </p>
      </div>
    `;

    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: {
          email: fromEmail,
          name: fromName,
        },
        to: [{ email: to }],
        subject: "Verify your email",
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `MailerSend request failed (${response.status}): ${errorBody}`,
      );
    }

    return true;
  } catch (error) {
    logger.error(
      { err: error, to },
      "Failed to send verification email"
    );
    return false;
  }
}

module.exports = sendVerificationEmail;
