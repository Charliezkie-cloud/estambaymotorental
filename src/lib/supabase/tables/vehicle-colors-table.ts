import { VehicleColorRow } from "@/types/models.types";
import { supabaseClient } from "@/lib/supabase/supabase-client";

// Functions
export async function getAllVehicleColors(): Promise<VehicleColorRow[] | null> {
  const { data, error } = await supabaseClient
    .from("vehicle_colors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createVehicleColor(name: string): Promise<VehicleColorRow | null> {
  const { data, error } = await supabaseClient
    .from("vehicle_colors")
    .insert({ name })
    .select("*")
    .single();

  if (error) throw error;
  if (!data) return null;

  return data;
}

export async function updateVehicleColor(id: number, name: string): Promise<VehicleColorRow | null> {
  const { data, error } = await supabaseClient
    .from("vehicle_colors")
    .update({ name })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  if (!data) return null;

  return data;
}

export async function deleteVehicleColor(id: number): Promise<VehicleColorRow | null> {
  try {
    const { data } = await supabaseClient
      .from("vehicle_colors")
      .delete()
      .eq("id", id)
      .select("*")
      .single();

    if (!data) return null;

    return data;
  } catch (error) {
    throw error;
  }
}
