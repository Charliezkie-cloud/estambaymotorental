import { PaymentMethodRow } from "@/types/models.types";
import { supabaseClient } from "@/lib/supabase/supabase-client";
import { ActualFileObject } from "filepond";
import { deleteFromBucket, getPublicUrl, uploadToBucket } from "@/lib/supabase/supabase-storage";

// Types
type CreatePaymentMethodParameters = {
  name: string;
  qrCodeImage?: ActualFileObject;
};

type UpdatePaymentMethodParameters = {
  id: number;
  name: string;
  oldImage?: string;
  newImage?: ActualFileObject;
};

// Functions
export async function getAllPaymentMethods(): Promise<PaymentMethodRow[] | null> {
  try {
    const { data } = await supabaseClient
      .from("payment_methods")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return null;

    return data.map(e => {
      const publicUrl = getPublicUrl("qr_codes", e.qr_code_image ?? "");
      return { ...e, qr_code_image_url: publicUrl };
    });
  } catch (error) {
    throw error;
  }
}

export async function createPaymentMethod({ name, qrCodeImage }: CreatePaymentMethodParameters): Promise<PaymentMethodRow | null> {
  try {
    let qrCodeImageFilename: string | null = null;

    if (qrCodeImage)
      qrCodeImageFilename = await uploadToBucket("qr_codes", qrCodeImage);

    const { data } = await supabaseClient
      .from("payment_methods")
      .insert({
        name,
        ...(qrCodeImageFilename && { qr_code_image: qrCodeImageFilename })
      })
      .select("*")
      .single();

    if (!data) return null;

    const publicUrl = getPublicUrl("qr_codes", data.qr_code_image ?? "");
    return { ...data, qr_code_image_url: publicUrl };
  } catch (error) {
    throw error;
  }
}

export async function updatePaymentMethod({ id, name, oldImage, newImage }: UpdatePaymentMethodParameters): Promise<PaymentMethodRow | null> {
  try {
    let newQrCodeImageFilename: string | null = null;

    if (oldImage && newImage) {
      await deleteFromBucket("qr_codes", [oldImage]);
      newQrCodeImageFilename = await uploadToBucket("qr_codes", newImage);
    }

    const { data } = await supabaseClient
      .from("payment_methods")
      .update({
        name,
        ...(newQrCodeImageFilename && { qr_code_image: newQrCodeImageFilename })
      })
      .eq("id", id)
      .select("*")
      .single();

    if (!data) return null;

    const publicUrl = getPublicUrl("qr_codes", data.qr_code_image ?? "");
    return { ...data, qr_code_image_url: publicUrl };
  } catch (error) {
    throw error;
  }
}

export async function deletePaymentMethod(id: number): Promise<PaymentMethodRow | null> {
  try {
    const { data } = await supabaseClient
      .from("payment_methods")
      .delete()
      .eq("id", id)
      .select("*")
      .single();

    if (!data) return null;

    if (data.qr_code_image)
      await deleteFromBucket("qr_codes", [data.qr_code_image]);

    return data;
  } catch (error) {
    throw error;
  }
}