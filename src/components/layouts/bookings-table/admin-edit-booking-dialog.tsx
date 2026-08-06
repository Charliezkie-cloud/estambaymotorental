import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDownIcon, ExternalLinkIcon, Loader2 } from "lucide-react";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { FilePond } from "react-filepond";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import React, { useEffect, useMemo, useState } from "react";
import { BookingRow, PaymentMethodRow, VehicleRow } from "@/types/models.types";
import { FilePondFile } from "filepond";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { getCurrentTimeString, getDaysBetween } from "@/lib/helpers/datetime-helpers";
import { MenuItem, paymentStatusMenuItems, bookingStatusMenuItems } from "@/lib/data/menu-items-data";
import { updateBooking } from "@/lib/supabase/tables/bookings-table";
import {
  checkBookingConflict,
  getVehicleActiveBookings,
  isDateBookedForVehicle,
} from "@/lib/helpers/booking-availability-helpers";
import Lightbox from "yet-another-react-lightbox";
import Image from "next/image";

type Props = {
  row?: BookingRow;
  bookingsRow: BookingRow[];
  vehiclesRow: VehicleRow[];
  paymentMethodRows: PaymentMethodRow[];
  onRowUpdate: (e: BookingRow | null) => void;
  onCancel: () => void;
};

const REQUIRED = <span className="text-destructive font-bold ms-0.5">*</span>;

export default function AdminEditBookingDialog({ row, bookingsRow, vehiclesRow, paymentMethodRows, onRowUpdate, onCancel }: Props) {
  // States
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  // Menu items
  const vehicleMenuItems = useMemo<MenuItem[]>(
    () => vehiclesRow.map((e) => ({ value: e.id, label: `${e.model} (${e.vehicle_colors?.name ?? "—"})` })),
    [vehiclesRow]
  );
  const paymentMethodMenuItems = useMemo<MenuItem[]>(
    () => paymentMethodRows.map((e) => ({ value: e.id, label: e.name })),
    [paymentMethodRows]
  );

  // Form states
  const [vehicle, setVehicle] = useState<number | null>(null);
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string | undefined>(undefined);

  const [rentalDate, setRentalDate] = useState<Date | undefined>(undefined);
  const [rentalTime, setRentalTime] = useState<string | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [returnTime, setReturnTime] = useState<string | undefined>(undefined);

  const [fullName, setFullName] = useState<string | undefined>(undefined);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(undefined);
  const [facebookAccount, setFacebookAccount] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<number | null>(null);
  const [paymentReceipts, setPaymentReceipts] = useState<FilePondFile[] | null>(null);
  const [driversLicense, setDriversLicense] = useState<FilePondFile[] | null>(null);
  const [validId, setValidId] = useState<FilePondFile[] | null>(null);

  const [isDelivery, setIsDelivery] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string | undefined>(undefined);
  const [deliveryFee, setDeliveryFee] = useState<number | undefined>(undefined);
  const [pickupFee, setPickupFee] = useState<number | undefined>(undefined);

  const [bookingStatus, setBookingStatus] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  // Active bookings for the selected vehicle, excluding the current booking being edited
  const activeBookings = useMemo(
    () => (vehicle ? getVehicleActiveBookings(bookingsRow, vehicle, row?.id) : []),
    [bookingsRow, vehicle, row?.id]
  );

  // Populate form when row changes
  useEffect(() => {
    if (!row) return;
    setVehicleImagePreview(undefined); // eslint-disable-line react-hooks/set-state-in-effect
    setVehicle(row.vehicle_id);
    setRentalDate(new Date(row.rental_date));
    setRentalTime(row.time_of_rental);
    setReturnDate(new Date(row.return_date));
    setReturnTime(row.time_of_return);
    setFullName(row.full_name);
    setPhoneNumber(row.phone_number);
    setFacebookAccount(row.facebook_account);
    setPaymentMethod(row.payment_method_id);
    setIsDelivery(!!row.is_delivery);
    setDeliveryAddress(row.address_for_delivery);
    setDeliveryFee(row.delivery_fee);
    setPickupFee(row.pickup_fee);
    setBookingStatus(row.booking_status);
    setPaymentStatus(row.payment_status);
  }, [row]);

  // Helpers
  function validateForm(): string | false {
    if (!vehicle || vehicle < 0) return "Vehicle is required.";
    if (!rentalDate || !rentalTime) return "Rental date and time is required.";
    if (!returnDate || !returnTime) return "Return date and time is required.";
    if (!fullName || fullName.trim().length < 1) return "Full name is required.";
    if (!phoneNumber || phoneNumber.trim().length < 1) return "Phone number is required.";
    if (!facebookAccount || facebookAccount.trim().length < 1) return "Facebook account is required.";
    if (!paymentMethod) return "Payment method is required.";
    if (isDelivery) {
      if (!deliveryAddress || deliveryAddress.trim().length < 1) return "Delivery address is required.";
      if (deliveryFee !== undefined && deliveryFee < 0) return "Delivery fee cannot be negative.";
      if (pickupFee !== undefined && pickupFee < 0) return "Pickup fee cannot be negative.";
    }
    return false;
  }

  // Handlers
  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!row) return;
    e.preventDefault();
    setLoading(true);

    const validationMessage = validateForm();
    if (validationMessage) {
      toast.error("Invalid Form Input", { description: validationMessage });
      return setLoading(false);
    }

    try {
      const dateNow = new Date();

      // Double-booking conflict check (exclude current booking)
      if (vehicle && rentalDate && rentalTime && returnDate && returnTime) {
        const conflictResult = checkBookingConflict(
          vehicle, rentalDate, rentalTime, returnDate, returnTime, bookingsRow, row.id
        );
        if (conflictResult.hasConflict) {
          toast.error("Double Booking Conflict", { description: conflictResult.message });
          return setLoading(false);
        }
      }

      const numberOfDaysRent = getDaysBetween(rentalDate ?? dateNow, returnDate ?? dateNow);
      const foundVehicleIdx = vehiclesRow.findIndex((e) => e.id === vehicle);
      const vehicleAmount = vehiclesRow[foundVehicleIdx].daily_price;
      let deliveryAmount = 0;
      if (isDelivery) {
        deliveryAmount += deliveryFee ?? 0;
        deliveryAmount += pickupFee ?? 0;
      }
      const totalAmount = (vehicleAmount * numberOfDaysRent) + deliveryAmount;

      const data = await updateBooking({
        id: row.id ?? -1,
        vehicle_id: vehicle ?? -1,
        number_of_days_rent: numberOfDaysRent,
        rental_date: rentalDate ? rentalDate.toDateString() : dateNow.toDateString(),
        time_of_rental: rentalTime ?? dateNow.toTimeString(),
        return_date: returnDate ? returnDate.toDateString() : dateNow.toDateString(),
        time_of_return: returnTime ?? dateNow.toTimeString(),
        full_name: fullName ?? "",
        phone_number: phoneNumber ?? "",
        facebook_account: facebookAccount ?? "",
        payment_method_id: paymentMethod ?? -1,
        oldPaymentReceiptImageFilename: row.payment_receipt_image,
        oldDriversLicenseImageFilename: row.drivers_license_image,
        oldValidIdImageFilename: row.valid_id_image,
        newPaymentReceiptImageFile: paymentReceipts ? paymentReceipts[0].file : undefined,
        newDriversLicenseImageFile: driversLicense ? driversLicense[0].file : undefined,
        newValidIdImageFile: validId ? validId[0].file : undefined,
        is_delivery: isDelivery ? 1 : 0,
        address_for_delivery: deliveryAddress ?? "",
        delivery_fee: deliveryFee ?? 0,
        pickup_fee: pickupFee ?? 0,
        booking_status: bookingStatus ?? 3,
        payment_status: paymentStatus ?? 3,
        amount: totalAmount,
      });

      toast.success("Booking Updated Successfully");
      onRowUpdate(data);
    } catch (error) {
      toast.error("Failed to Update Booking", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {imagePreview && (
        <Lightbox
          open={!!imagePreview}
          close={() => setImagePreview(undefined)}
          slides={[{ src: imagePreview }]}
        />
      )}

      <Dialog open={!!row}>
        <DialogContent showCloseButton={false} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Editing booking for{" "}
              <span className="font-medium text-foreground">{row?.full_name ?? "customer"}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] pe-1">
            <form id="edit-booking-form" onSubmit={onFormSubmit}>
              <FieldGroup className="space-y-5">

                {/* — Booking Status — */}
                <div className="space-y-7">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Booking Status</p>
                    <Separator />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field>
                      <FieldLabel htmlFor="edit-booking-status">Booking Status {REQUIRED}</FieldLabel>
                      <Select
                        items={bookingStatusMenuItems}
                        value={bookingStatus}
                        onValueChange={(e) => setBookingStatus(e)}
                        name="booking_status"
                        required
                      >
                        <SelectTrigger id="edit-booking-status">
                          <SelectValue placeholder="Select a booking status" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger>
                          <SelectGroup>
                            {bookingStatusMenuItems.map((item) => (
                              <SelectItem key={`edit-booking-status-${item.value}`} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>Current booking status.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-payment-status">Payment Status {REQUIRED}</FieldLabel>
                      <Select
                        items={paymentStatusMenuItems}
                        value={paymentStatus}
                        onValueChange={(e) => setPaymentStatus(e)}
                        name="payment_status"
                        required
                      >
                        <SelectTrigger id="edit-payment-status">
                          <SelectValue placeholder="Select a payment status" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger>
                          <SelectGroup>
                            {paymentStatusMenuItems.map((item) => (
                              <SelectItem key={`edit-payment-status-${item.value}`} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>Current payment status.</FieldDescription>
                    </Field>
                  </div>
                </div>

                {/* — Rental Details — */}
                <div className="space-y-7">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rental Details</p>
                    <Separator />
                  </div>

                  <Field>
                    <FieldLabel htmlFor="edit-vehicle">Vehicle {REQUIRED}</FieldLabel>
                    <Select
                      items={vehicleMenuItems}
                      value={vehicle}
                      onValueChange={(e) => {
                        setVehicle(e);
                        const idx = vehiclesRow.findIndex((r) => r.id === e);
                        setVehicleImagePreview(idx !== -1 ? vehiclesRow[idx].imageUrl : undefined);
                      }}
                      name="vehicle"
                      required
                    >
                      <SelectTrigger id="edit-vehicle">
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger>
                        <SelectGroup>
                          {vehicleMenuItems.map((item) => (
                            <SelectItem key={`edit-vehicle-item-${item.value}`} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>Vehicle assigned to this booking.</FieldDescription>
                  </Field>

                  {vehicleImagePreview && (
                    <div
                      className="group relative w-full aspect-video rounded-xl overflow-hidden border border-border cursor-pointer"
                      onClick={() => setImagePreview(vehicleImagePreview)}
                    >
                      <Image
                        src={vehicleImagePreview}
                        alt="Selected vehicle"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        fill
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                        <ExternalLinkIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 drop-shadow-lg" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field>
                      <FieldLabel>Rental Date {REQUIRED}</FieldLabel>
                      <Popover>
                        <PopoverTrigger render={
                          <Button
                            variant="outline"
                            data-empty={!rentalDate}
                            className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                          >
                            {rentalDate ? format(rentalDate, "PPP") : <span>Pick a rental date</span>}
                            <ChevronDownIcon data-icon="inline-end" />
                          </Button>
                        } />
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            disabled={(date) => isDateBookedForVehicle(date, activeBookings)}
                            selected={rentalDate}
                            onSelect={(e) => {
                              setRentalDate(e);
                              setRentalTime(getCurrentTimeString(e));
                            }}
                            defaultMonth={rentalDate}
                            required
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldDescription>Start date of the rental.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-rental-time">Rental Time {REQUIRED}</FieldLabel>
                      <Input
                        id="edit-rental-time"
                        type="time"
                        name="rental_time"
                        value={rentalTime ?? ""}
                        onChange={(e) => setRentalTime(e.target.value)}
                        step="1"
                        required
                      />
                      <FieldDescription>Start time of the rental.</FieldDescription>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field>
                      <FieldLabel>Return Date {REQUIRED}</FieldLabel>
                      <Popover>
                        <PopoverTrigger render={
                          <Button
                            variant="outline"
                            data-empty={!returnDate}
                            className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                          >
                            {returnDate ? format(returnDate, "PPP") : <span>Pick a return date</span>}
                            <ChevronDownIcon data-icon="inline-end" />
                          </Button>
                        } />
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            disabled={(date) =>
                              date < (rentalDate ?? new Date()) ||
                              isDateBookedForVehicle(date, activeBookings)
                            }
                            selected={returnDate}
                            onSelect={(e) => {
                              setReturnDate(e);
                              setReturnTime(getCurrentTimeString(e));
                            }}
                            defaultMonth={returnDate}
                            required
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldDescription>Return date of the rental.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-return-time">Return Time {REQUIRED}</FieldLabel>
                      <Input
                        id="edit-return-time"
                        type="time"
                        name="return_time"
                        value={returnTime ?? ""}
                        onChange={(e) => setReturnTime(e.target.value)}
                        step="1"
                        required
                      />
                      <FieldDescription>Return time of the rental.</FieldDescription>
                    </Field>
                  </div>
                </div>

                {/* — Customer Details — */}
                <div className="space-y-7">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Customer Details</p>
                    <Separator />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field>
                      <FieldLabel htmlFor="edit-full-name">Full Name {REQUIRED}</FieldLabel>
                      <Input
                        id="edit-full-name"
                        name="full_name"
                        autoComplete="off"
                        placeholder="e.g. John A. Doe"
                        value={fullName ?? ""}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                      <FieldDescription>Full name of the customer.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-phone-number">Phone Number {REQUIRED}</FieldLabel>
                      <Input
                        id="edit-phone-number"
                        name="phone_number"
                        autoComplete="off"
                        placeholder="e.g. 0912 345 6789"
                        value={phoneNumber ?? ""}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                      <FieldDescription>Contact number of the customer.</FieldDescription>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field>
                      <FieldLabel htmlFor="edit-facebook">Facebook Account {REQUIRED}</FieldLabel>
                      <Input
                        id="edit-facebook"
                        name="facebook_account"
                        autoComplete="off"
                        placeholder="e.g. John Doe"
                        value={facebookAccount ?? ""}
                        onChange={(e) => setFacebookAccount(e.target.value)}
                        required
                      />
                      <FieldDescription>Facebook account of the customer.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-payment-method">Payment Method {REQUIRED}</FieldLabel>
                      <Select
                        items={paymentMethodMenuItems}
                        value={paymentMethod}
                        onValueChange={(e) => setPaymentMethod(e)}
                        required
                      >
                        <SelectTrigger id="edit-payment-method">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger>
                          <SelectGroup>
                            {paymentMethodMenuItems.map((item) => (
                              <SelectItem key={`edit-pm-item-${item.value}`} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>Payment method used by the customer.</FieldDescription>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>Payment Receipt</FieldLabel>
                    <FilePond
                      name="payment_receipt"
                      onupdatefiles={setPaymentReceipts}
                      allowMultiple={false}
                      acceptedFileTypes={["image/*"]}
                      maxFileSize="10MB"
                      className="filepond--dark"
                      allowFileTypeValidation
                      allowFileSizeValidation
                    />
                    <FieldDescription>Leave empty to keep the existing receipt image.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Driver&apos;s License</FieldLabel>
                    <FilePond
                      name="drivers_license"
                      onupdatefiles={setDriversLicense}
                      allowMultiple={false}
                      acceptedFileTypes={["image/*"]}
                      maxFileSize="10MB"
                      className="filepond--dark"
                      allowFileTypeValidation
                      allowFileSizeValidation
                    />
                    <FieldDescription>Leave empty to keep the existing driver&apos;s license image.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Valid ID</FieldLabel>
                    <FilePond
                      name="valid_id"
                      onupdatefiles={setValidId}
                      allowMultiple={false}
                      acceptedFileTypes={["image/*"]}
                      maxFileSize="10MB"
                      className="filepond--dark"
                      allowFileTypeValidation
                      allowFileSizeValidation
                    />
                    <FieldDescription>Leave empty to keep the existing valid ID image.</FieldDescription>
                  </Field>
                </div>

                {/* — Delivery Details — */}
                <div className="space-y-7">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Delivery Details</p>
                    <Separator />
                  </div>

                  <Field>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="edit-is-delivery"
                        name="is_delivery"
                        checked={isDelivery}
                        onCheckedChange={(e) => setIsDelivery(e)}
                      />
                      <Label htmlFor="edit-is-delivery">Enable Delivery</Label>
                    </div>
                    <FieldDescription>Toggle if the vehicle will be delivered to the customer.</FieldDescription>
                  </Field>

                  {isDelivery && (
                    <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-5">
                      <Field>
                        <FieldLabel htmlFor="edit-delivery-address">Delivery Address {REQUIRED}</FieldLabel>
                        <Input
                          id="edit-delivery-address"
                          type="text"
                          name="delivery_address"
                          placeholder="e.g. Cebu City, Cebu, Philippines"
                          value={deliveryAddress ?? ""}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          required
                        />
                        <FieldDescription>Full delivery address of the customer.</FieldDescription>
                      </Field>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field>
                          <FieldLabel htmlFor="edit-delivery-fee">Delivery Fee {REQUIRED}</FieldLabel>
                          <Input
                            id="edit-delivery-fee"
                            type="number"
                            name="delivery_fee"
                            min={0}
                            value={deliveryFee ?? 0}
                            onChange={(e) => setDeliveryFee(Number.parseInt(e.target.value))}
                            required
                          />
                          <FieldDescription>Fee for delivering the vehicle.</FieldDescription>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="edit-pickup-fee">Pickup Fee {REQUIRED}</FieldLabel>
                          <Input
                            id="edit-pickup-fee"
                            type="number"
                            name="pickup_fee"
                            min={0}
                            value={pickupFee ?? 0}
                            onChange={(e) => setPickupFee(Number.parseInt(e.target.value))}
                            required
                          />
                          <FieldDescription>Fee for picking up the vehicle after rental.</FieldDescription>
                        </Field>
                      </div>
                    </div>
                  )}
                </div>
              </FieldGroup>
            </form>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border">
            <DialogClose onClick={onCancel}>Cancel</DialogClose>
            <Button type="submit" form="edit-booking-form" disabled={loading} className="min-w-[130px]">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}