import { supabaseClient } from "@/lib/supabase/supabase-client";
import { ActualFileObject } from "filepond";
import { deleteFromBucket, uploadToBucket, VEHICLES_BUCKET } from "@/lib/supabase/supabase-storage";
import { VehicleRow } from "@/types/models.types";

// Types
type CreateVehicleParameters = {
  model: string;
  year_model: number;
  daily_price: number;
  half_day_price: number;
  hourly_price: number;
  color: number;
  status?: number;
  image: ActualFileObject;
};

type UpdateVehicleParameters = {
  id: number;
  model: string;
  year_model: number;
  daily_price: number;
  half_day_price: number;
  hourly_price: number;
  color: number;
  status?: number;
  oldImage: string;
  newImage?: ActualFileObject;
};

// Functions
export async function getAllVehicles(): Promise<VehicleRow[] | null> {
  const { data, error } = await supabaseClient
    .from("vehicles")
    .select("*, vehicle_colors(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return null;

  return data.map(e => {
    const { data: storageData } = supabaseClient
      .storage
      .from("vehicles")
      .getPublicUrl(e.image)

    return { ...e, imageUrl: storageData.publicUrl };
  });
}

export async function createVehicle({ model, year_model, daily_price, half_day_price, hourly_price, color, status, image }: CreateVehicleParameters): Promise<VehicleRow | null> {
  try {
    const newFilename = await uploadToBucket(VEHICLES_BUCKET, image);
    const { data } = await supabaseClient
      .from("vehicles")
      .insert({
        model,
        year_model,
        daily_price,
        half_day_price,
        hourly_price,
        color,
        status: status ?? 1,
        image: newFilename
      })
      .select("*, vehicle_colors(name)")
      .single();

    if (!data) return null;

    const { data: storageData } = supabaseClient
      .storage
      .from("vehicles")
      .getPublicUrl(data.image);

    return { ...data, imageUrl: storageData.publicUrl };
  } catch (error) {
    throw error;
  }
}

export async function updateVehicle({ id, model, year_model, daily_price, half_day_price, hourly_price, color, status, oldImage, newImage }: UpdateVehicleParameters): Promise<VehicleRow | null>{
  try {
    let newFilename: string | null = null;

    if (newImage) {
      await deleteFromBucket("vehicles", [oldImage]);
      newFilename = await uploadToBucket("vehicles", newImage);
    }

    const { data } = await supabaseClient
      .from("vehicles")
      .update({
        model,
        year_model,
        daily_price,
        half_day_price,
        hourly_price,
        color,
        status: status ?? 1,
        ...(newFilename && { image: newFilename })
      })
      .eq("id", id)
      .select("*, vehicle_colors(name)")
      .single();

    if (!data) return null;

    const { data: storageData } = supabaseClient
      .storage
      .from("vehicles")
      .getPublicUrl(data.image ?? "");

    return { ...data, imageUrl: storageData.publicUrl };
  } catch (error) {
    throw error;
  }
}

export async function deleteVehicle(id: number): Promise<VehicleRow | null> {
  try {
    const { data } = await supabaseClient
      .from("vehicles")
      .delete()
      .eq("id", id)
      .select("*")
      .single();

    if (!data) return null;

    await deleteFromBucket("vehicles", [data.image]);
    return data;
  } catch (error) {
    throw error;
  }
}