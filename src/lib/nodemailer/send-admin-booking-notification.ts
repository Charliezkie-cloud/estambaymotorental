import { readFile } from "fs/promises";
import path from "path";

import {
  ADMIN_BOOKING_NOTIFICATION_TEMPLATE_PATH,
  applyEmailTemplatePlaceholders,
} from "@/lib/helpers/email-template-helpers";
import {
  AdminBookingNotificationPayload,
  buildAdminBookingNotificationPlaceholders,
} from "@/lib/helpers/email-notification-helpers";
import {
  MAILER_ADMIN_RECIPIENT_EMAIL,
  MAILER_EMAIL_ADDRESS,
} from "@/lib/nodemailer/mailer-config";
import { transporter } from "@/lib/nodemailer/nodemailer-client";

async function loadAdminBookingNotificationTemplate(): Promise<string> {
  const relativePath = ADMIN_BOOKING_NOTIFICATION_TEMPLATE_PATH.replace(
    /^\//,
    "",
  );
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  return readFile(absolutePath, "utf-8");
}

export interface SendAdminBookingNotificationResult {
  messageId: string;
  accepted: string[];
}

/**
 * Renders the admin booking HTML template and sends it to the configured admin recipient.
 */
export async function sendAdminBookingNotification(
  payload: AdminBookingNotificationPayload,
): Promise<SendAdminBookingNotificationResult> {
  if (!MAILER_EMAIL_ADDRESS || !MAILER_ADMIN_RECIPIENT_EMAIL) {
    throw new Error(
      "Mailer is not configured. Set MAILER_EMAIL_ADDRESS and MAILER_ADMIN_RECIPIENT_EMAIL.",
    );
  }

  const rawHtml = await loadAdminBookingNotificationTemplate();
  const placeholders = buildAdminBookingNotificationPlaceholders(payload);
  const html = applyEmailTemplatePlaceholders(rawHtml, placeholders);

  const info = await transporter.sendMail({
    from: {
      name: "Estambay Moto Rentals",
      address: MAILER_EMAIL_ADDRESS,
    },
    to: MAILER_ADMIN_RECIPIENT_EMAIL,
    subject: `New Booking #${payload.id} — ${payload.full_name}`,
    html,
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted.map(String),
  };
}
