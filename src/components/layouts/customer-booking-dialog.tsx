"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { FilePond } from "react-filepond";
import { FilePondFile } from "filepond";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import Lightbox from "yet-another-react-lightbox";
import { BookingRow, PaymentMethodRow, VehicleRow } from "@/types/models.types";
import { getCurrentTimeString, getDaysBetween } from "@/lib/helpers/datetime-helpers";
import type { AdminBookingNotificationPayload } from "@/lib/helpers/email-notification-helpers";
import { createBooking, getAllBookings } from "@/lib/supabase/tables/bookings-table";
import {
  checkBookingConflict,
  getFormattedBookedSchedules,
  getVehicleActiveBookings,
  isDateBookedForVehicle,
} from "@/lib/helpers/booking-availability-helpers";

interface CustomerBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: VehicleRow[];
  paymentMethods: PaymentMethodRow[];
  selectedVehicleId?: number | null;
}

export function CustomerBookingDialog({
  open,
  onOpenChange,
  vehicles,
  paymentMethods,
  selectedVehicleId,
}: CustomerBookingDialogProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [existingBookings, setExistingBookings] = useState<BookingRow[]>([]);

  // Step 1 states
  const [vehicleId, setVehicleId] = useState<number | null>(selectedVehicleId ?? null);
  const [rentalDate, setRentalDate] = useState<Date | undefined>(undefined);
  const [rentalTime, setRentalTime] = useState<string>("");
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [returnTime, setReturnTime] = useState<string>("");

  // Step 2 states
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [facebookAccount, setFacebookAccount] = useState<string>("");
  const [driversLicenseFiles, setDriversLicenseFiles] = useState<FilePondFile[]>([]);
  const [validIdFiles, setValidIdFiles] = useState<FilePondFile[]>([]);

  // Step 3 (Delivery) states
  const [isDelivery, setIsDelivery] = useState<boolean>(false);
  const [addressForDelivery, setAddressForDelivery] = useState<string>("");

  // Step 4 (Payment) states
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [paymentReceiptFiles, setPaymentReceiptFiles] = useState<FilePondFile[]>([]);
  const [qrLightboxOpen, setQrLightboxOpen] = useState<boolean>(false);

  // Reset or initialize state when open changes or selectedVehicleId changes
  useEffect(() => {
    if (open) {
      if (selectedVehicleId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVehicleId(selectedVehicleId);
      }
      async function fetchBookingsData() {
        try {
          const data = await getAllBookings();
          setExistingBookings(data ?? []);
        } catch (err) {
          console.error("Failed to load existing bookings:", err);
        }
      }
      fetchBookingsData();
    } else {
      setStep(1);
      setRentalDate(undefined);
      setRentalTime("");
      setReturnDate(undefined);
      setReturnTime("");
      setFullName("");
      setPhoneNumber("");
      setFacebookAccount("");
      setDriversLicenseFiles([]);
      setValidIdFiles([]);
      setIsDelivery(false);
      setAddressForDelivery("");
      setPaymentMethodId(null);
      setPaymentReceiptFiles([]);
      setQrLightboxOpen(false);
    }
  }, [open, selectedVehicleId]);

  // Active bookings for the currently selected vehicle
  const activeVehicleBookings = vehicleId
    ? getVehicleActiveBookings(existingBookings, vehicleId)
    : [];
  const bookedSchedules = getFormattedBookedSchedules(activeVehicleBookings);

  // Handle Step 1 Next
  const handleStep1Next = () => {
    if (!vehicleId) {
      toast.error("Please select a vehicle.");
      return;
    }
    if (!rentalDate || !rentalTime) {
      toast.error("Please provide both rental date and rental time.");
      return;
    }
    if (!returnDate || !returnTime) {
      toast.error("Please provide both return date and return time.");
      return;
    }

    // Check for double booking conflict
    const conflictResult = checkBookingConflict(
      vehicleId,
      rentalDate,
      rentalTime,
      returnDate,
      returnTime,
      existingBookings
    );

    if (conflictResult.hasConflict) {
      toast.error("Double Booking Conflict", {
        description: conflictResult.message,
      });
      return;
    }

    setStep(2);
  };

  // Handle Step 2 Next
  const handleStep2Next = () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (!facebookAccount.trim()) {
      toast.error("Please enter your Facebook account.");
      return;
    }
    if (driversLicenseFiles.length === 0) {
      toast.error("Please upload your driver's license image.");
      return;
    }
    if (validIdFiles.length === 0) {
      toast.error("Please upload your valid ID image.");
      return;
    }
    setStep(3);
  };

  // Handle Step 3 (Delivery) Next
  const handleStep3Next = () => {
    if (isDelivery && !addressForDelivery.trim()) {
      toast.error("Please enter a delivery address.");
      return;
    }
    setStep(4);
  };

  // Handle Submit (Step 4)
  const handleSubmit = async () => {
    if (!paymentMethodId) {
      toast.error("Please select a payment method.");
      return;
    }
    if (paymentReceiptFiles.length === 0) {
      toast.error("Please upload your payment receipt image.");
      return;
    }

    setLoading(true);
    try {
      const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
      const daysCount = getDaysBetween(rentalDate!, returnDate!);
      const dailyPrice = selectedVehicle?.daily_price ?? 0;
      const totalAmount = dailyPrice * daysCount;

      const booking = await createBooking({
        vehicle_id: vehicleId!,
        number_of_days_rent: daysCount,
        rental_date: rentalDate!.toDateString(),
        time_of_rental: rentalTime,
        return_date: returnDate!.toDateString(),
        time_of_return: returnTime,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        facebook_account: facebookAccount.trim(),
        payment_method_id: paymentMethodId,
        paymentReceiptImageFile: paymentReceiptFiles[0].file,
        driversLicenseImageFile: driversLicenseFiles[0].file,
        validIdImageFile: validIdFiles[0].file,
        is_delivery: isDelivery ? 1 : 0,
        address_for_delivery: isDelivery ? addressForDelivery.trim() : "",
        delivery_fee: 0,
        pickup_fee: 0,
        booking_status: 3, // Reserved
        payment_status: 3, // Pending
        amount: totalAmount,
      });

      if (booking) {
        const paymentMethodName =
          paymentMethods.find((pm) => pm.id === paymentMethodId)?.name ??
          booking.payment_methods?.name ??
          "";

        const notificationPayload: AdminBookingNotificationPayload = {
          id: booking.id,
          created_at: booking.created_at,
          full_name: booking.full_name,
          phone_number: booking.phone_number,
          facebook_account: booking.facebook_account,
          vehicle_id: booking.vehicle_id,
          number_of_days_rent: booking.number_of_days_rent,
          rental_date: booking.rental_date,
          time_of_rental: booking.time_of_rental,
          return_date: booking.return_date,
          time_of_return: booking.time_of_return,
          is_delivery: booking.is_delivery,
          address_for_delivery: booking.address_for_delivery,
          delivery_fee: booking.delivery_fee,
          pickup_fee: booking.pickup_fee,
          payment_method_id: booking.payment_method_id,
          payment_status: booking.payment_status,
          booking_status: booking.booking_status,
          amount: booking.amount,
          vehicle_model: selectedVehicle?.model ?? booking.vehicles?.model ?? "",
          vehicle_year_model: selectedVehicle?.year_model ?? 0,
          payment_method_name: paymentMethodName,
        };

        try {
          const notificationResponse = await fetch("/api/email-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notificationPayload),
          });

          if (!notificationResponse.ok) {
            console.error(
              "Failed to send admin booking notification:",
              await notificationResponse.text(),
            );
          }
        } catch (notifyError) {
          console.error("Failed to send admin booking notification:", notifyError);
        }
      }

      toast.success("Booking request submitted successfully!", {
        description: "We will review your reservation shortly.",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to submit booking", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find((pm) => pm.id === paymentMethodId);

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === 1),
    [vehicles],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="space-y-3 pb-2 border-b border-border mt-8">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-heading font-extrabold">Book Your Ride</DialogTitle>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Step {step} of 4
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === 1 && "Select vehicle & schedule rental dates"}
            {step === 2 && "Enter your contact info & upload identification"}
            {step === 3 && "Delivery options (Optional)"}
            {step === 4 && "Choose payment method & upload receipt"}
          </DialogDescription>

          {/* Progress Bar */}
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-primary h-full transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 py-4 px-1 pe-3">
          {/* STEP 1: Rental Schedule & Vehicle Selection */}
          {step === 1 && (
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="vehicle_id">
                  Vehicle <span className="text-red-400 font-bold">*</span>
                </FieldLabel>
                <Select
                  value={vehicleId}
                  onValueChange={(val) => setVehicleId(val)}
                  items={availableVehicles.map((v) => ({
                    value: v.id,
                    label: `${v.model} (${v.vehicle_colors?.name ?? "Standard"}) - ₱${v.daily_price}/day`,
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {availableVehicles.map((v) => (
                        <SelectItem key={`booking-v-${v.id}`} value={v.id}>
                          {v.model} ({v.vehicle_colors?.name ?? "Standard"}) - ₱{v.daily_price}/day
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Choose the vehicle you want to rent.</FieldDescription>
              </Field>

              {vehicleId && bookedSchedules.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs space-y-1.5">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Existing Reservations for this Vehicle:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {bookedSchedules.map((s) => (
                      <li key={`schedule-${s.id}`}>{s.displayText}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>
                    Rental Date <span className="text-red-400 font-bold">*</span>
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          data-empty={!rentalDate}
                          className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                        >
                          {rentalDate ? format(rentalDate, "PPP") : <span>Pick a Rental Date</span>}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={rentalDate}
                        onSelect={(d) => {
                          setRentalDate(d);
                          if (d) setRentalTime(getCurrentTimeString(d));
                        }}
                        disabled={(d) =>
                          d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          isDateBookedForVehicle(d, activeVehicleBookings)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldDescription>Pick start date.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="time_of_rental">
                    Time of Rental <span className="text-red-400 font-bold">*</span>
                  </FieldLabel>
                  <Input
                    type="time"
                    id="time_of_rental"
                    value={rentalTime}
                    onChange={(e) => setRentalTime(e.target.value)}
                    step="1"
                    required
                  />
                  <FieldDescription>Pick start time.</FieldDescription>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>
                    Return Date <span className="text-red-400 font-bold">*</span>
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          data-empty={!returnDate}
                          className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                        >
                          {returnDate ? format(returnDate, "PPP") : <span>Pick a Return Date</span>}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={(d) => {
                          setReturnDate(d);
                          if (d) setReturnTime(getCurrentTimeString(d));
                        }}
                        disabled={(d) => {
                          const minDate = rentalDate ?? new Date();
                          const startOfDayMin = new Date(minDate);
                          startOfDayMin.setHours(0, 0, 0, 0);
                          return (
                            d < startOfDayMin ||
                            isDateBookedForVehicle(d, activeVehicleBookings)
                          );
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldDescription>Pick return date.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="time_of_return">
                    Time of Return <span className="text-red-400 font-bold">*</span>
                  </FieldLabel>
                  <Input
                    type="time"
                    id="time_of_return"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    step="1"
                    required
                  />
                  <FieldDescription>Pick return time.</FieldDescription>
                </Field>
              </div>
            </FieldGroup>
          )}

          {/* STEP 2: Customer Information & Files */}
          {step === 2 && (
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="full_name">
                  Full Name <span className="text-red-400 font-bold">*</span>
                </FieldLabel>
                <Input
                  id="full_name"
                  placeholder="e.g. Juan Cruz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <FieldDescription>Your complete legal name.</FieldDescription>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="phone_number">
                    Phone Number <span className="text-red-400 font-bold">*</span>
                  </FieldLabel>
                  <Input
                    id="phone_number"
                    placeholder="e.g. 09171234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <FieldDescription>Active contact number.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="facebook_account">
                    Facebook Account / Link <span className="text-red-400 font-bold">*</span>
                  </FieldLabel>
                  <Input
                    id="facebook_account"
                    placeholder="e.g. facebook.com/juancruz"
                    value={facebookAccount}
                    onChange={(e) => setFacebookAccount(e.target.value)}
                    required
                  />
                  <FieldDescription>For identity verification.</FieldDescription>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="drivers_license_image">
                  Driver&apos;s License Image <span className="text-red-400 font-bold">*</span>
                </FieldLabel>
                <FilePond
                  name="drivers_license_image"
                  onupdatefiles={setDriversLicenseFiles}
                  allowMultiple={false}
                  acceptedFileTypes={["image/*"]}
                  maxFileSize="10MB"
                  className="filepond--dark"
                  allowFileTypeValidation
                  allowFileSizeValidation
                />
                <FieldDescription>Clear photo of your valid driver&apos;s license.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="valid_id_image">
                  Valid ID Image <span className="text-red-400 font-bold">*</span>
                </FieldLabel>
                <FilePond
                  name="valid_id_image"
                  onupdatefiles={setValidIdFiles}
                  allowMultiple={false}
                  acceptedFileTypes={["image/*"]}
                  maxFileSize="10MB"
                  className="filepond--dark"
                  allowFileTypeValidation
                  allowFileSizeValidation
                />
                <FieldDescription>Clear photo of a government-issued ID.</FieldDescription>
              </Field>
            </FieldGroup>
          )}

          {/* STEP 3: Optional Delivery Details */}
          {step === 3 && (
            <FieldGroup className="space-y-4">
              <Field>
                <div className="flex items-center space-x-3">
                  <Switch
                    id="is_delivery"
                    checked={isDelivery}
                    onCheckedChange={(checked) => setIsDelivery(checked)}
                  />
                  <Label htmlFor="is_delivery" className="font-semibold text-sm cursor-pointer">
                    Request Vehicle Delivery
                  </Label>
                </div>
                <FieldDescription>Toggle on if you want the vehicle delivered to your specified address.</FieldDescription>
              </Field>

              <AnimatePresence>
                {isDelivery && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <Field className="mt-2">
                      <FieldLabel htmlFor="address_for_delivery">
                        Delivery Address <span className="text-red-400 font-bold">*</span>
                      </FieldLabel>
                      <Input
                        id="address_for_delivery"
                        placeholder="e.g. 123 Main Street, Cebu City"
                        value={addressForDelivery}
                        onChange={(e) => setAddressForDelivery(e.target.value)}
                        required
                      />
                      <FieldDescription>Provide full address for vehicle drop-off and pickup.</FieldDescription>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </FieldGroup>
          )}

          {/* STEP 4: Payment Method & Receipt Upload */}
          {step === 4 && (
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="payment_method_id">
                  Payment Method <span className="text-red-400 font-bold">*</span>
                </FieldLabel>
                <Select
                  value={paymentMethodId}
                  onValueChange={(val) => setPaymentMethodId(val)}
                  items={paymentMethods.map((pm) => ({
                    value: pm.id,
                    label: pm.name,
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {paymentMethods.map((pm) => (
                        <SelectItem key={`booking-pm-${pm.id}`} value={pm.id}>
                          {pm.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Choose how you want to pay for the reservation.</FieldDescription>
              </Field>

              {selectedPaymentMethod && (selectedPaymentMethod.qr_code_image && selectedPaymentMethod.qr_code_image_url) && (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Scan QR Code to Pay ({selectedPaymentMethod.name})
                  </span>
                  <button
                    type="button"
                    onClick={() => setQrLightboxOpen(true)}
                    className="relative w-64 h-64 sm:w-96 sm:h-96 rounded-lg overflow-hidden cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary"
                    title="Click or tap the image to go full screen"
                  >
                    <Image
                      src={selectedPaymentMethod.qr_code_image_url}
                      alt={`${selectedPaymentMethod.name} QR Code`}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                      Click to expand
                    </div>
                  </button>
                  <p className="text-xs text-muted-foreground italic">
                    click or tap the image to go full screen
                  </p>
                  <Lightbox
                    open={qrLightboxOpen}
                    close={() => setQrLightboxOpen(false)}
                    slides={[{ src: selectedPaymentMethod.qr_code_image_url }]}
                  />
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="payment_receipt_image">
                  Payment Receipt Image <span className="text-red-400 font-bold">*</span>
                </FieldLabel>
                <FilePond
                  name="payment_receipt_image"
                  onupdatefiles={setPaymentReceiptFiles}
                  allowMultiple={false}
                  acceptedFileTypes={["image/*"]}
                  maxFileSize="10MB"
                  className="filepond--dark"
                  allowFileTypeValidation
                  allowFileSizeValidation
                />
                <FieldDescription>Upload a clear photo or screenshot of your payment receipt.</FieldDescription>
              </Field>
            </FieldGroup>
          )}
        </div>

        {/* Dialog Actions / Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
            >
              Previous
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          )}

          {step < 4 ? (
            <Button
              type="button"
              onClick={
                step === 1
                  ? handleStep1Next
                  : step === 2
                  ? handleStep2Next
                  : handleStep3Next
              }
            >
              {step === 3 && !isDelivery ? "Skip & Continue" : "Next Step"}
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  Submitting <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Complete Booking <CheckCircle2 className="ms-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

