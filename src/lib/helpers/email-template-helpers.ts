export interface EmailTemplatePlaceholders {
  id: string;
  created_at: string;
  full_name: string;
  phone_number: string;
  facebook_account: string;
  vehicle_id: string;
  vehicle_model: string;
  vehicle_year_model: string;
  number_of_days_rent: string;
  rental_date: string;
  time_of_rental: string;
  return_date: string;
  time_of_return: string;
  is_delivery: string;
  is_delivery_label: string;
  address_for_delivery: string;
  delivery_fee: string;
  pickup_fee: string;
  payment_method_id: string;
  payment_method_name: string;
  payment_status: string;
  payment_status_label: string;
  booking_status: string;
  booking_status_label: string;
  amount: string;
  admin_dashboard_url: string;
}

/** Sample booking payload used for admin email template previews. */
export const SAMPLE_ADMIN_BOOKING_NOTIFICATION: EmailTemplatePlaceholders = {
  id: "1042",
  created_at: "August 8, 2026 at 2:45 PM",
  full_name: "Juan Dela Cruz",
  phone_number: "0917 123 4567",
  facebook_account: "facebook.com/juandelacruz",
  vehicle_id: "3",
  vehicle_model: "Honda ADV 160",
  vehicle_year_model: "2024",
  number_of_days_rent: "3",
  rental_date: "2026-08-15",
  time_of_rental: "09:00",
  return_date: "2026-08-18",
  time_of_return: "09:00",
  is_delivery: "1",
  is_delivery_label: "Yes",
  address_for_delivery: "123 Mabini St, Cebu City",
  delivery_fee: "150.00",
  pickup_fee: "0.00",
  payment_method_id: "1",
  payment_method_name: "GCash",
  payment_status: "3",
  payment_status_label: "Pending",
  booking_status: "3",
  booking_status_label: "Reserved",
  amount: "2,250.00",
  admin_dashboard_url: "/admin/bookings",
};

export const ADMIN_BOOKING_NOTIFICATION_TEMPLATE_PATH =
  "/html-templates/admin-booking-notification.html";

/**
 * Replaces `{{placeholder}}` tokens in an email HTML template with the given values.
 */
export function applyEmailTemplatePlaceholders(
  html: string,
  placeholders: EmailTemplatePlaceholders,
): string {
  return Object.entries(placeholders).reduce((result, [key, value]) => {
    const token = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    return result.replace(token, value);
  }, html);
}
