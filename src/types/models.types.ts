import { Database } from "@/types/database.types";

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
  receipt_image_url?: string;
  drivers_license_image_url?: string;
  valid_id_image_url?: string;
};
