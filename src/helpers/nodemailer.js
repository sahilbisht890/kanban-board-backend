const nodemailer = require("nodemailer");


async function sendVerificationEmail(to, verificationLink) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Todoist" <${process.env.EMAIL_USER}>`,
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
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

module.exports = sendVerificationEmail;
