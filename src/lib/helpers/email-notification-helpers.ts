import { Database } from "@/types/database.types";
import {
  EmailTemplatePlaceholders,
} from "@/lib/helpers/email-template-helpers";
import { getAdminDashboardBookingsUrl } from "@/lib/nodemailer/mailer-config";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

/** Booking fields required for the admin notification email (no document images). */
export type AdminBookingNotificationPayload = Pick<
  BookingRow,
  | "id"
  | "created_at"
  | "full_name"
  | "phone_number"
  | "facebook_account"
  | "vehicle_id"
  | "number_of_days_rent"
  | "rental_date"
  | "time_of_rental"
  | "return_date"
  | "time_of_return"
  | "is_delivery"
  | "address_for_delivery"
  | "delivery_fee"
  | "pickup_fee"
  | "payment_method_id"
  | "payment_status"
  | "booking_status"
  | "amount"
> & {
  vehicle_model: string;
  vehicle_year_model: number;
  payment_method_name: string;
  admin_dashboard_url?: string;
};

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  data?: AdminBookingNotificationPayload;
}

const BOOKING_STATUS_LABELS: Record<number, string> = {
  1: "Completed",
  2: "Change Unit",
  3: "Reserved",
  4: "Rescheduled",
  5: "Cancelled",
  6: "On Going",
};

const PAYMENT_STATUS_LABELS: Record<number, string> = {
  1: "Paid",
  2: "Partially Paid",
  3: "Pending",
};

const REQUIRED_NONEMPTY_STRING_KEYS = [
  "created_at",
  "full_name",
  "phone_number",
  "facebook_account",
  "rental_date",
  "time_of_rental",
  "return_date",
  "time_of_return",
  "vehicle_model",
  "payment_method_name",
] as const;

const REQUIRED_NUMBER_KEYS = [
  "id",
  "vehicle_id",
  "number_of_days_rent",
  "is_delivery",
  "delivery_fee",
  "pickup_fee",
  "payment_method_id",
  "payment_status",
  "booking_status",
  "amount",
  "vehicle_year_model",
] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-PH", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export function getBookingStatusLabel(status: number): string {
  return BOOKING_STATUS_LABELS[status] ?? `Unknown (${status})`;
}

export function getPaymentStatusLabel(status: number): string {
  return PAYMENT_STATUS_LABELS[status] ?? `Unknown (${status})`;
}

export function getIsDeliveryLabel(isDelivery: number): string {
  return isDelivery === 1 ? "Yes" : "No";
}

/**
 * Validates the JSON body against the booking notification payload contract.
 */
export function validateAdminBookingNotificationPayload(
  body: unknown,
): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, errors: ["Request body must be a JSON object."] };
  }

  const payload = body as Record<string, unknown>;

  for (const key of REQUIRED_NONEMPTY_STRING_KEYS) {
    if (!isNonEmptyString(payload[key])) {
      errors.push(`"${key}" must be a non-empty string.`);
    }
  }

  if (typeof payload.address_for_delivery !== "string") {
    errors.push('"address_for_delivery" must be a string.');
  }

  for (const key of REQUIRED_NUMBER_KEYS) {
    if (!isFiniteNumber(payload[key])) {
      errors.push(`"${key}" must be a finite number.`);
    }
  }

  if (
    payload.admin_dashboard_url !== undefined &&
    typeof payload.admin_dashboard_url !== "string"
  ) {
    errors.push('"admin_dashboard_url" must be a string when provided.');
  }

  if (isFiniteNumber(payload.is_delivery)) {
    if (payload.is_delivery !== 0 && payload.is_delivery !== 1) {
      errors.push('"is_delivery" must be 0 or 1.');
    }

    if (
      payload.is_delivery === 1 &&
      typeof payload.address_for_delivery === "string" &&
      !payload.address_for_delivery.trim()
    ) {
      errors.push(
        '"address_for_delivery" is required when is_delivery is 1.',
      );
    }
  }

  if (isFiniteNumber(payload.booking_status)) {
    if (!(payload.booking_status in BOOKING_STATUS_LABELS)) {
      errors.push('"booking_status" must be a valid booking status code (1–6).');
    }
  }

  if (isFiniteNumber(payload.payment_status)) {
    if (!(payload.payment_status in PAYMENT_STATUS_LABELS)) {
      errors.push('"payment_status" must be a valid payment status code (1–3).');
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const data: AdminBookingNotificationPayload = {
    id: payload.id as number,
    created_at: (payload.created_at as string).trim(),
    full_name: (payload.full_name as string).trim(),
    phone_number: (payload.phone_number as string).trim(),
    facebook_account: (payload.facebook_account as string).trim(),
    vehicle_id: payload.vehicle_id as number,
    number_of_days_rent: payload.number_of_days_rent as number,
    rental_date: (payload.rental_date as string).trim(),
    time_of_rental: (payload.time_of_rental as string).trim(),
    return_date: (payload.return_date as string).trim(),
    time_of_return: (payload.time_of_return as string).trim(),
    is_delivery: payload.is_delivery as number,
    address_for_delivery: (payload.address_for_delivery as string).trim(),
    delivery_fee: payload.delivery_fee as number,
    pickup_fee: payload.pickup_fee as number,
    payment_method_id: payload.payment_method_id as number,
    payment_status: payload.payment_status as number,
    booking_status: payload.booking_status as number,
    amount: payload.amount as number,
    vehicle_model: (payload.vehicle_model as string).trim(),
    vehicle_year_model: payload.vehicle_year_model as number,
    payment_method_name: (payload.payment_method_name as string).trim(),
    admin_dashboard_url:
      typeof payload.admin_dashboard_url === "string"
        ? payload.admin_dashboard_url.trim()
        : undefined,
  };

  return { ok: true, errors: [], data };
}

export function buildAdminBookingNotificationPlaceholders(
  payload: AdminBookingNotificationPayload,
): EmailTemplatePlaceholders {
  return {
    id: String(payload.id),
    created_at: formatCreatedAt(payload.created_at),
    full_name: payload.full_name,
    phone_number: payload.phone_number,
    facebook_account: payload.facebook_account,
    vehicle_id: String(payload.vehicle_id),
    vehicle_model: payload.vehicle_model,
    vehicle_year_model: String(payload.vehicle_year_model),
    number_of_days_rent: String(payload.number_of_days_rent),
    rental_date: payload.rental_date,
    time_of_rental: payload.time_of_rental,
    return_date: payload.return_date,
    time_of_return: payload.time_of_return,
    is_delivery: String(payload.is_delivery),
    is_delivery_label: getIsDeliveryLabel(payload.is_delivery),
    address_for_delivery: payload.address_for_delivery || "N/A",
    delivery_fee: formatCurrency(payload.delivery_fee),
    pickup_fee: formatCurrency(payload.pickup_fee),
    payment_method_id: String(payload.payment_method_id),
    payment_method_name: payload.payment_method_name,
    payment_status: String(payload.payment_status),
    payment_status_label: getPaymentStatusLabel(payload.payment_status),
    booking_status: String(payload.booking_status),
    booking_status_label: getBookingStatusLabel(payload.booking_status),
    amount: formatCurrency(payload.amount),
    admin_dashboard_url:
      payload.admin_dashboard_url || getAdminDashboardBookingsUrl(),
  };
}
