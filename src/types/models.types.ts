import { Database } from "@/types/database.types";

export type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"] & {
  vehicle_colors: { name: string; };
  imageUrl?: string;
};

export type VehicleColorRow = Database["public"]["Tables"]["vehicle_colors"]["Row"];
