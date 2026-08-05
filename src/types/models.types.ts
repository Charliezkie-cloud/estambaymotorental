import { Database } from "@/types/database.types";

// Tables
export type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"] & {
  vehicle_colors?: { name: string; };
  imageUrl?: string;
};
export type VehicleColorRow = Database["public"]["Tables"]["vehicle_colors"]["Row"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"] & {
  vehicles?: {
    model: string;
    vehicle_colors?: {
      name: string;
    }
  }
  payment_methods?: {
    name: string;
  }
  receipt_image_url?: string;
  drivers_license_image_url?: string;
  valid_id_image_url?: string;
};
export type PaymentMethodRow = Database["public"]["Tables"]["payment_methods"]["Row"] & {
  qr_code_image_url?: string;
}

// Views
export type MonthlyBookingsCountsViewItem = Database["public"]["Views"]["monthly_bookings_counts"]["Row"];
export type VehicleIncomesViewItem = Database["public"]["Views"]["vehicles_income"]["Row"];
  