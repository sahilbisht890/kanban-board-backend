const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);


async function sendVerificationEmail(to, verificationLink) {
  try {
    await resend.emails.send({
      from: `Todoist <${process.env.RESEND_FROM_EMAIL}>`,
      to,
      subject: "Verify your email",
      html: `
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
      `,
    });

    return true;
  } catch (error) {
    console.error(
      "Failed to send verification email:",
      error?.message || error
    );
    return false;
  }
}

module.exports = sendVerificationEmail;
