/**
 * Centralized Nodemailer / email-notification configuration.
 * Values come from environment variables — never hardcode secrets or recipients in routes.
 */

export const MAILER_EMAIL_ADDRESS = process.env.MAILER_EMAIL_ADDRESS ?? "";
export const MAILER_APP_PASSWORD = process.env.MAILER_APP_PASSWORD ?? "";

/** Admin inbox that receives new booking notification emails. */
export const MAILER_ADMIN_RECIPIENT_EMAIL =
  process.env.MAILER_ADMIN_RECIPIENT_EMAIL ?? "";

export function getAdminDashboardBookingsUrl(): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (!siteUrl) {
    return "/admin/bookings";
  }

  return `${siteUrl}/admin/bookings`;
}
