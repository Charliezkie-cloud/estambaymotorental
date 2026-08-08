import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/nodemailer/send-admin-booking-notification", () => ({
  sendAdminBookingNotification: vi.fn(),
}));

import { POST } from "@/app/api/email-notification/route";
import { sendAdminBookingNotification } from "@/lib/nodemailer/send-admin-booking-notification";
import type { AdminBookingNotificationPayload } from "@/lib/helpers/email-notification-helpers";

const mockedSendAdminBookingNotification = vi.mocked(
  sendAdminBookingNotification,
);

const validPayload: AdminBookingNotificationPayload = {
  id: 42,
  created_at: "2026-08-08T09:00:00.000Z",
  full_name: "Juan Dela Cruz",
  phone_number: "09171234567",
  facebook_account: "juan.delacruz",
  vehicle_id: 7,
  number_of_days_rent: 2,
  rental_date: "2026-08-10",
  time_of_rental: "2026-08-10T09:00:00.000Z",
  return_date: "2026-08-12",
  time_of_return: "2026-08-12T09:00:00.000Z",
  is_delivery: 0,
  address_for_delivery: "",
  delivery_fee: 0,
  pickup_fee: 0,
  payment_method_id: 1,
  payment_status: 3,
  booking_status: 3,
  amount: 1500,
  vehicle_model: "Honda Click 125i",
  vehicle_year_model: 2024,
  payment_method_name: "GCash",
};

function createJsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/email-notification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/email-notification", () => {
  beforeEach(() => {
    mockedSendAdminBookingNotification.mockReset();
  });

  it("returns 400 when the request body is not valid JSON", async () => {
    const request = createJsonRequest("{ not-json");

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "Invalid JSON body." });
    expect(mockedSendAdminBookingNotification).not.toHaveBeenCalled();
  });

  it("returns 400 when payload validation fails", async () => {
    const request = createJsonRequest({ full_name: "Missing most fields" });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Validation failed.");
    expect(Array.isArray(json.details)).toBe(true);
    expect(json.details.length).toBeGreaterThan(0);
    expect(mockedSendAdminBookingNotification).not.toHaveBeenCalled();
  });

  it("returns 200 and message metadata when the notification is sent", async () => {
    mockedSendAdminBookingNotification.mockResolvedValue({
      messageId: "<msg-42@estambay>",
      accepted: ["admin@example.com"],
    });

    const request = createJsonRequest(validPayload);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      message: "Admin booking notification sent.",
      messageId: "<msg-42@estambay>",
      accepted: ["admin@example.com"],
    });
    expect(mockedSendAdminBookingNotification).toHaveBeenCalledTimes(1);
    expect(mockedSendAdminBookingNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: validPayload.id,
        full_name: validPayload.full_name,
        vehicle_model: validPayload.vehicle_model,
      }),
    );
  });

  it("returns 500 when sending the notification throws", async () => {
    mockedSendAdminBookingNotification.mockRejectedValue(
      new Error("SMTP connection refused"),
    );

    const request = createJsonRequest(validPayload);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "SMTP connection refused" });
    expect(mockedSendAdminBookingNotification).toHaveBeenCalledTimes(1);
  });

  it("returns a generic 500 message for non-Error throw values", async () => {
    mockedSendAdminBookingNotification.mockRejectedValue("boom");

    const request = createJsonRequest(validPayload);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      error: "Failed to send admin booking notification.",
    });
  });
});
