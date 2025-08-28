import nodemailer from "nodemailer";

const sendResetEmail = async (to, resetUrl) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,     
      pass: process.env.SMTP_PASS,     
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: "Password Reset Link",
    html: `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendResetEmail;
