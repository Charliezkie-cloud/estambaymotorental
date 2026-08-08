import { NextResponse } from "next/server";

import { validateAdminBookingNotificationPayload } from "@/lib/helpers/email-notification-helpers";
import { sendAdminBookingNotification } from "@/lib/nodemailer/send-admin-booking-notification";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const validation = validateAdminBookingNotificationPayload(body);

  if (!validation.ok || !validation.data) {
    return NextResponse.json(
      { error: "Validation failed.", details: validation.errors },
      { status: 400 },
    );
  }

  try {
    const result = await sendAdminBookingNotification(validation.data);

    return NextResponse.json(
      {
        success: true,
        message: "Admin booking notification sent.",
        messageId: result.messageId,
        accepted: result.accepted,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send admin booking notification.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
