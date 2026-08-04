import { BookingRow } from "@/types/models.types";
import { supabaseClient } from "@/lib/supabase/supabase-client";
import { deleteFromBucket, getSignedUrl, uploadToBucket } from "@/lib/supabase/supabase-storage";
import { ActualFileObject } from "filepond";

// Types
type CreateBookingParameters = {
  vehicle_id: number;
  number_of_days_rent: number;
  rental_date: string;
  time_of_rental: string;
  return_date: string;
  time_of_return: string;
  full_name: string;
  phone_number: string;
  facebook_account: string;
  payment_method: string;
  paymentReceiptImageFile: ActualFileObject;
  driversLicenseImageFile: ActualFileObject;
  validIdImageFile: ActualFileObject;
  is_delivery: number;
  address_for_delivery: string;
  delivery_fee: number;
  pickup_fee: number;
  booking_status: number;
  payment_status: number;
  amount: number;
};

type UpdateBookingParameters = {
  id: number;
  vehicle_id: number;
  number_of_days_rent: number;
  rental_date: string;
  time_of_rental: string;
  return_date: string;
  time_of_return: string;
  full_name: string;
  phone_number: string;
  facebook_account: string;
  payment_method: string;
  oldPaymentReceiptImageFilename?: string;
  oldDriversLicenseImageFilename?: string;
  oldValidIdImageFilename?: string;
  newPaymentReceiptImageFile?: ActualFileObject;
  newDriversLicenseImageFile?: ActualFileObject;
  newValidIdImageFile?: ActualFileObject;
  is_delivery: number;
  address_for_delivery: string;
  delivery_fee: number;
  pickup_fee: number;
  booking_status: number;
  payment_status: number;
  amount: number;
};

// Functions
export async function getAllBookings(limit?: number): Promise<BookingRow[] | null> {
  try {
    let data: BookingRow[] | null;

    if (limit) {
      const { data: responseData } = await supabaseClient
        .from("bookings")
        .select("*, vehicles(model, vehicle_colors(name))")
        .order("created_at", { ascending: false })
        .limit(limit);
      data = responseData;
    } else {
      const { data: responseData } = await supabaseClient
        .from("bookings")
        .select("*, vehicles(model, vehicle_colors(name))")
        .order("created_at", { ascending: false });
      data = responseData;
    }

    if (!data) return null;

    return await Promise.all(
      data.map(async (e) => {
        const [receiptImageUrl, driversLicenseImageUrl, validIdImageUrl] = await Promise.all([
          getSignedUrl("receipts", e.payment_receipt_image),
          getSignedUrl("drivers_license", e.drivers_license_image),
          getSignedUrl("ids", e.valid_id_image),
        ]);

        return {
          ...e,
          receipt_image_url: receiptImageUrl,
          drivers_license_image_url: driversLicenseImageUrl,
          valid_id_image_url: validIdImageUrl
        };
      })
    );
  } catch (error) {
    throw error;
  }
}

export async function updateBookingStatus(id: number, status: number, isPayment?: boolean): Promise<BookingRow | null> {
  try {
    let data: BookingRow | null = null;

    if (isPayment) {
      const { data: responseData } = await supabaseClient
        .from("bookings")
        .update({ payment_status: status })
        .eq("id", id)
        .select("*, vehicles(model, vehicle_colors(name))")
        .single();
      data = responseData;
    } else {
      const { data: responseData } = await supabaseClient
        .from("bookings")
        .update({ booking_status: status })
        .eq("id", id)
        .select("*, vehicles(model, vehicle_colors(name))")
        .single();
      data = responseData;
    }

    if (!data) return null;

    const [paymentReceiptImageUrl, driversLicenseImageUrl, validIdImageUrl] = await Promise.all([
      await getSignedUrl("receipts", data.payment_receipt_image),
      await getSignedUrl("drivers_license", data.drivers_license_image),
      await getSignedUrl("ids", data.valid_id_image),
    ]);

    return {
      ...data,
      receipt_image_url: paymentReceiptImageUrl,
      drivers_license_image_url: driversLicenseImageUrl,
      valid_id_image_url: validIdImageUrl,
    }
  } catch (error) {
    throw error;
  }
}

export async function createBooking({
                                      vehicle_id,
                                      number_of_days_rent,
                                      rental_date,
                                      time_of_rental,
                                      return_date,
                                      time_of_return,
                                      full_name,
                                      phone_number,
                                      facebook_account,
                                      payment_method,
                                      paymentReceiptImageFile,
                                      driversLicenseImageFile,
                                      validIdImageFile,
                                      is_delivery,
                                      address_for_delivery,
                                      delivery_fee,
                                      pickup_fee,
                                      booking_status,
                                      payment_status,
                                      amount,
                                    }: CreateBookingParameters): Promise<BookingRow | null> {
  try {
    const paymentReceiptFilename = await uploadToBucket("receipts", paymentReceiptImageFile);
    const driversLicenseFilename = await uploadToBucket("drivers_license", driversLicenseImageFile);
    const validIdFilename = await uploadToBucket("ids", validIdImageFile);

    const { data } = await supabaseClient
      .from("bookings")
      .insert({
        vehicle_id,
        number_of_days_rent,
        rental_date,
        time_of_rental,
        return_date,
        time_of_return,
        full_name,
        phone_number,
        facebook_account,
        payment_method,
        payment_receipt_image: paymentReceiptFilename,
        drivers_license_image: driversLicenseFilename,
        valid_id_image: validIdFilename,
        is_delivery,
        address_for_delivery,
        delivery_fee,
        pickup_fee,
        booking_status,
        payment_status,
        amount
      })
      .select("*, vehicles(model, vehicle_colors(name))")
      .single();

    if (!data) return null;

    const paymentReceiptSignedUrl = await getSignedUrl("receipts", data.payment_receipt_image);
    const driversLicenseSignedUrl = await getSignedUrl("drivers_license", data.drivers_license_image);
    const validIdSignedUrl = await getSignedUrl("ids", data.valid_id_image);

    return {
      ...data,
      receipt_image_url: paymentReceiptSignedUrl,
      drivers_license_image_url: driversLicenseSignedUrl,
      valid_id_image_url: validIdSignedUrl
    };
  } catch (error) {
    throw error;
  }
}

export async function updateBooking({
                                      id,
                                      vehicle_id,
                                      number_of_days_rent,
                                      rental_date,
                                      time_of_rental,
                                      return_date,
                                      time_of_return,
                                      full_name,
                                      phone_number,
                                      facebook_account,
                                      payment_method,
                                      oldPaymentReceiptImageFilename,
                                      oldDriversLicenseImageFilename,
                                      oldValidIdImageFilename,
                                      newPaymentReceiptImageFile,
                                      newDriversLicenseImageFile,
                                      newValidIdImageFile,
                                      is_delivery,
                                      address_for_delivery,
                                      delivery_fee,
                                      pickup_fee,
                                      booking_status,
                                      payment_status,
                                      amount,
                                    }: UpdateBookingParameters): Promise<BookingRow | null> {
  try {
    let newPaymentReceiptImageFilename: string | null = null;
    let newDriverseLienceseImageFilename: string | null = null;
    let newValidIdImageFilename: string | null = null;

    if (oldPaymentReceiptImageFilename && newPaymentReceiptImageFile) {
      await deleteFromBucket("receipts", [oldPaymentReceiptImageFilename]);
      newPaymentReceiptImageFilename = await uploadToBucket("receipts", newPaymentReceiptImageFile);
    }
    if (oldDriversLicenseImageFilename && newDriversLicenseImageFile) {
      await deleteFromBucket("drivers_license", [oldDriversLicenseImageFilename]);
      newDriverseLienceseImageFilename = await uploadToBucket("drivers_license", newDriversLicenseImageFile);
    }
    if (oldValidIdImageFilename && newValidIdImageFile) {
      await deleteFromBucket("ids", [oldValidIdImageFilename]);
      newValidIdImageFilename = await uploadToBucket("ids", newValidIdImageFile);
    }

    const { data } = await supabaseClient
      .from("bookings")
      .update({
        vehicle_id,
        number_of_days_rent,
        rental_date,
        time_of_rental,
        return_date,
        time_of_return,
        full_name,
        phone_number,
        facebook_account,
        payment_method,
        ...(newPaymentReceiptImageFilename && { payment_receipt_image: newPaymentReceiptImageFilename }),
        ...(newDriverseLienceseImageFilename && { drivers_license_image: newDriverseLienceseImageFilename }),
        ...(newValidIdImageFilename && { valid_id_image: newValidIdImageFilename }),
        is_delivery,
        address_for_delivery,
        delivery_fee,
        pickup_fee,
        booking_status,
        payment_status,
        amount
      })
      .select("*, vehicles(model, vehicle_colors(name))")
      .eq("id", id)
      .single();

    if (!data) return null;

    const paymentReceiptSignedUrl = await getSignedUrl("receipts", data.payment_receipt_image);
    const driversLicenseSignedUrl = await getSignedUrl("drivers_license", data.drivers_license_image);
    const validIdSignedUrl = await getSignedUrl("ids", data.valid_id_image);

    return {
      ...data,
      receipt_image_url: paymentReceiptSignedUrl,
      drivers_license_image_url: driversLicenseSignedUrl,
      valid_id_image_url: validIdSignedUrl
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteBooking(id: number): Promise<BookingRow | null> {
  const { data, error } = await supabaseClient
    .from("bookings")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  if (!data) return null;

  await deleteFromBucket("receipts", [data.payment_receipt_image]);
  await deleteFromBucket("drivers_license", [data.drivers_license_image]);
  await deleteFromBucket("ids", [data.valid_id_image]);

  return data;
}