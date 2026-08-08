import nodemailer from "nodemailer";

import {
  MAILER_APP_PASSWORD,
  MAILER_EMAIL_ADDRESS,
} from "@/lib/nodemailer/mailer-config";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAILER_EMAIL_ADDRESS,
    pass: MAILER_APP_PASSWORD,
  },
});
