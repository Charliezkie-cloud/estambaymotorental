import nodemailer from "nodemailer";

const MAILER_EMAIL_ADDRESS = process.env.MAILER_EMAIL_ADDRESS ?? "";
const MAILER_APP_PASSWORD = process.env.MAILER_APP_PASSWORD ?? "";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAILER_EMAIL_ADDRESS,
    pass: MAILER_APP_PASSWORD
  }
});