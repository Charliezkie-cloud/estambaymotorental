import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { ChevronDownIcon, Loader2, PlusIcon } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import React, { useEffect, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet
} from "@/components/ui/field";
import { BookingRow, VehicleRow } from "@/types/models.types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { FilePondFile } from "filepond";
import { FilePond } from "react-filepond";
import { motion, AnimatePresence } from "motion/react";

import "yet-another-react-lightbox/styles.css";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MenuItem, paymentMethodMenuItems, paymentStatusMenuItems, bookingStatusMenuItems } from "@/lib/menu-items-data";
import { DRIVERS_LICENSE_BUCKET, IDS_BUCKET, RECEIPTS_BUCKET, uploadToBucket } from "@/lib/storage-helpers";
import { SELECT_BOOKING_QUERY } from "@/lib/table-helpers";
import { getDaysBetween } from "@/lib/date-time-helpers";

type Props = {
  supabaseClient: SupabaseClient<Database>;
  vehiclesRow: VehicleRow[];
  onRowAdd: (e: BookingRow) => void;
};

export default function AdminAddBookingDialog({ vehiclesRow, supabaseClient, onRowAdd }: Props) {
  // States
  const [open, setOpen] = useState(false);

  // Menu items
  const [vehicleMenuItems, setVehicleMenuItems] = useState<MenuItem[]>([]);

  // Form states
  const [vehicle, setVehicle] = useState<number | null>(null);

  const [rentalDate, setRentalDate] = useState<Date | undefined>(undefined);
  const [rentalTime, setRentalTime] = useState<string | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [returnTime, setReturnTime] = useState<string | undefined>(undefined);

  const [fullName, setFullName] = useState<string | undefined>(undefined);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(undefined);
  const [facebookAccount, setFacebookAccount] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paymentReceipts, setPaymentReceipts] = useState<FilePondFile[] | null>(null);
  const [driversLicense, setDriversLicense] = useState<FilePondFile[] | null>(null);
  const [validId, setValidId] = useState<FilePondFile[] | null>(null);

  const [isDelivery, setIsDelivery] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string | undefined>(undefined);
  const [deliveryFee, setDeliveryFee] = useState<number | undefined>(undefined);
  const [pickupFee, setPickupFee] = useState<number | undefined>(undefined);

  const [bookingStatus, setBookingStatus] = useState<number | null>(3);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(3);

  const [loading, setLoading] = useState(false);

  // Handlers
  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const validationMessage = validateForm();
    if (typeof validationMessage === "string") {
      toast.error("Invalid Form Input", { description: validationMessage });
      return setLoading(false);
    }

    if (!paymentReceipts) {
      toast.error("Invalid Form Input", { description: "Payment receipt image is required." });
      return setLoading(false);
    }
    if (!driversLicense) {
      toast.error("Invalid Form Input", { description: "Drivers license image is required." });
      return setLoading(false);
    }
    if (!validId) {
      toast.error("Invalid Form Input", { description: "Valid ID image is required." });
      return setLoading(false);
    }

    try {
      const dateNow = new Date();
      const numberOfDaysRent = getDaysBetween(rentalDate ?? dateNow, returnDate ?? dateNow);
      const receiptFilename = await uploadToBucket(RECEIPTS_BUCKET, paymentReceipts[0].file);
      const driversLicenseFilename = await uploadToBucket(DRIVERS_LICENSE_BUCKET, driversLicense[0].file);
      const validIdFilename = await uploadToBucket(IDS_BUCKET, validId[0].file);

      const foundVehiclesIndex = vehiclesRow.findIndex(e => e.id === vehicle);
      const vehicleAmount = vehiclesRow[foundVehiclesIndex].daily_price;

      let deliveryAmount = 0;
      if (isDelivery) {
        deliveryAmount += deliveryFee ?? 0;
        deliveryAmount += pickupFee ?? 0;
      }

      const totalAmount = vehicleAmount + deliveryAmount;

      const { data, error } = await supabaseClient
        .from("bookings")
        .insert({
          vehicle_id: vehicle ?? -1,

          number_of_days_rent: numberOfDaysRent,
          rental_date:  rentalDate ? rentalDate.toDateString() : dateNow.toDateString(),
          time_of_rental: rentalTime ?? dateNow.toTimeString(),
          return_date:  returnDate ? returnDate.toDateString() : dateNow.toDateString(),
          time_of_return: returnTime ?? dateNow.toTimeString(),

          full_name: fullName ?? "",
          phone_number: phoneNumber ?? "",
          facebook_account: facebookAccount ?? "",
          payment_method: paymentMethod ?? "",
          payment_receipt_image: receiptFilename,
          drivers_license_image: driversLicenseFilename,
          valid_id_image: validIdFilename,

          is_delivery: isDelivery ? 1 : 0,
          address_for_delivery: deliveryAddress ?? "",
          delivery_fee: deliveryFee ?? 0,
          pickup_fee: pickupFee ?? 0,

          booking_status: bookingStatus ?? 3,
          payment_status: paymentStatus ?? 3,

          amount: totalAmount
        })
        .select(SELECT_BOOKING_QUERY)
        .single();

      if (error) return toast.error("Failed to Add Booking", { description: error.message });

      toast.success("Booking Added Successfully");
      setOpen(false);
      onRowAdd(data);
    } finally {
      setLoading(false);
    }
  }

  // Helpers
  function validateForm(): string | boolean {
    if (vehicle && vehicle < 0) return "Vehicle is required.";

    if (!rentalDate || !rentalTime) return "Rental date and time is required.";
    if (!returnDate || !rentalTime) return "Return date and time is required.";

    if (fullName && fullName.trim().length < 1) return "Full name is required.";
    if (phoneNumber && phoneNumber.trim().length < 1) return "Phone number is required.";
    if (facebookAccount && facebookAccount.trim().length < 1) return "Facebook account is required.";
    if (!paymentMethod) return "Payment method is required.";
    if (paymentReceipts && paymentReceipts.length < 1) return "Payment receipt is required.";
    if (driversLicense && driversLicense.length < 1) return "Drivers license is required.";
    if (validId && validId.length < 1) return "Valid ID is required.";

    // Is delivery
    if (!isDelivery)
      return false;

    if (deliveryAddress && deliveryAddress.trim().length < 1) return "Delivery address is required.";
    if (deliveryFee && deliveryFee < 0) return "Delivery fee cannot be a negative number.";
    if (pickupFee && pickupFee < 0) return "Pickup fee cannot be a negative number.";

    return false;
  }

  // Use effects
  useEffect(() => {
    async function mapVehicleMenuItems() {
      const mappedVehicleMenuItems: MenuItem[] = vehiclesRow.map(e => {
        return { value: e.id, label: e.model };
      });

      setVehicleMenuItems(mappedVehicleMenuItems);
    }

    mapVehicleMenuItems();
  }, [vehiclesRow]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="ms-auto">
        <PlusIcon />
      </DialogTrigger>

      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add Booking</DialogTitle>
          <DialogDescription>Add a booking manually.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[75vh] pe-2">
          <form id="add-booking-form" onSubmit={onFormSubmit}>
            <FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend>Booking Status</FieldLegend>
                <FieldDescription>The status of the booking.</FieldDescription>

                <Field>
                  <FieldLabel htmlFor="booking_status">Booking Status <span className="text-red-400 font-bold">*</span></FieldLabel>
                  <Select items={bookingStatusMenuItems} value={bookingStatus} onValueChange={e => setBookingStatus(e)} autoComplete="off" name="booking_status" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Booking Status" />
                    </SelectTrigger>

                    <SelectContent alignItemWithTrigger>
                      <SelectGroup>
                        {bookingStatusMenuItems.map(item => (
                          <SelectItem key={`edit-booking-booking-status-item-${item.value}`} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>Select a booking status.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="payment_status">Payment Status <span className="text-red-400 font-bold">*</span></FieldLabel>
                  <Select items={paymentStatusMenuItems} value={paymentStatus} onValueChange={e => setPaymentStatus(e)} autoComplete="off" name="payment_status" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Payment Status" />
                    </SelectTrigger>

                    <SelectContent alignItemWithTrigger>
                      <SelectGroup>
                        {paymentStatusMenuItems.map(item => (
                          <SelectItem key={`edit-booking-payment-status-item-${item.value}`} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>Select a payment status.</FieldDescription>
                </Field>
              </FieldSet>

              <FieldSeparator />
              <FieldSet>
                <FieldLegend>Rental Details</FieldLegend>
                <FieldDescription>The details of the rental.</FieldDescription>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="vehicle">Vehicle <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <Select items={vehicleMenuItems} value={vehicle} onValueChange={e => setVehicle(e)} autoComplete="off" name="vehicle" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Vehicle" />
                      </SelectTrigger>

                      <SelectContent alignItemWithTrigger>
                        <SelectGroup>
                          {vehicleMenuItems.map(item => (
                            <SelectItem key={`add-booking-vehicle-item-${item.value}`} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>Choose a vehicle for the rental.</FieldDescription>
                  </Field>

                  <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                    <Field>
                      <FieldLabel>Rental Date <span className="text-red-400 font-bold">*</span></FieldLabel>
                      <Popover>
                        <PopoverTrigger render={
                          <Button variant={"outline"} data-empty={!rentalDate} className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground">
                            {rentalDate ? format(rentalDate, "PPP") : <span>Pick a Rental Date</span>}
                            <ChevronDownIcon data-icon="inline-end" />
                          </Button>} />

                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single"
                                    disabled={{ before: new Date() }}
                                    selected={rentalDate ?? new Date()}
                                    onSelect={setRentalDate}
                                    defaultMonth={rentalDate}
                                    required />
                        </PopoverContent>
                      </Popover>
                      <FieldDescription>Pick the start of the rental.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="rental_time">Rental Time <span className="text-red-400 font-bold">*</span></FieldLabel>
                      <Input type="time"
                             name="rental_time"
                             value={rentalTime ?? ""}
                             onChange={e => setRentalTime(e.target.value)}
                             step="1"
                             required />
                      <FieldDescription>Pick the start time of the rental.</FieldDescription>
                    </Field>
                  </div>

                  <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                    <Field>
                      <FieldLabel>Return Date <span className="text-red-400 font-bold">*</span></FieldLabel>
                      <Popover>
                        <PopoverTrigger render={
                          <Button variant={"outline"} data-empty={!returnDate} className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground">
                            {returnDate ? format(returnDate, "PPP") : <span>Pick a Return Date</span>}
                            <ChevronDownIcon data-icon="inline-end" />
                          </Button>} />

                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single"
                                    disabled={{ before: rentalDate ?? new Date() }}
                                    selected={returnDate ?? new Date()}
                                    onSelect={setReturnDate}
                                    defaultMonth={returnDate}
                                    required />
                        </PopoverContent>
                      </Popover>
                      <FieldDescription>Pick the return date of the rental.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="return_date">Return Time <span className="text-red-400 font-bold">*</span></FieldLabel>
                      <Input type="time"
                             name="return_time"
                             value={returnTime ?? ""}
                             onChange={e => setReturnTime(e.target.value)}
                             step="1"
                             required />
                      <FieldDescription>Pick the return time of the rental.</FieldDescription>
                    </Field>
                  </div>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator/>
              <FieldSet>
                <FieldLegend>Customer Details</FieldLegend>
                <FieldDescription>The details of the customer.</FieldDescription>
                <FieldGroup>
                  <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                    <Field>
                      <FieldLabel htmlFor="full_name">Full Name <span className="text-red-400 font-bold">*</span></FieldLabel>
                      <Input name="full_name" value={fullName ?? ""} onChange={e => setFullName(e.target.value)} autoComplete="off" placeholder="e.g. John A. Doe" required />
                      <FieldDescription>Full name of the customer.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phone_number">Phone Number <span className="text-red-400 font-bold">*</span></FieldLabel>
                      <Input name="phone_number" value={phoneNumber ?? ""} onChange={e => setPhoneNumber(e.target.value)} autoComplete="off" placeholder="e.g. 091 234 5678" required />
                      <FieldDescription>Phone number of the customer.</FieldDescription>
                    </Field>
                  </div>

                  <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                    <Field>
                      <FieldLabel htmlFor="facebook_account">Facebook Account <span className="text-red-400 font-bold">*</span></FieldLabel>
                      <Input name="facebok_account" value={facebookAccount ?? ""} onChange={e => setFacebookAccount(e.target.value)} autoComplete="off" placeholder="e.g. John Doe" required />
                      <FieldDescription>Facebook account of the customer.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="payment_method">Payment Method <span className="text-red-400 font-bold">*</span></FieldLabel>
                      <Select items={paymentMethodMenuItems} value={paymentMethod} onValueChange={e => setPaymentMethod(e)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Payment Method" />
                        </SelectTrigger>

                        <SelectContent alignItemWithTrigger>
                          <SelectGroup>
                            {paymentMethodMenuItems.map((item, index) => (
                              <SelectItem key={`add-booking-payment-method-item-${index}`} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>Choose the payment method of the rental.</FieldDescription>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="payment_receipt">Payment Receipt <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <FilePond name="payment_receipt"
                              onupdatefiles={setPaymentReceipts}
                              allowMultiple={false}
                              acceptedFileTypes={["image/*"]}
                              maxFileSize="10MB"
                              className="filepond--dark"
                              allowFileTypeValidation
                              allowFileSizeValidation />
                    <FieldDescription>Upload a clear photo of the receipt.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="drivers_license">Drivers License <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <FilePond name="drivers_license"
                              onupdatefiles={setDriversLicense}
                              allowMultiple={false}
                              acceptedFileTypes={["image/*"]}
                              maxFileSize="10MB"
                              className="filepond--dark"
                              allowFileTypeValidation
                              allowFileSizeValidation />
                    <FieldDescription>Upload a clear photo of the renters driver license.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="valid_id">Valid ID <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <FilePond name="valid_id"
                              onupdatefiles={setValidId}
                              allowMultiple={false}
                              acceptedFileTypes={["image/*"]}
                              maxFileSize="10MB"
                              className="filepond--dark"
                              allowFileTypeValidation
                              allowFileSizeValidation />
                    <FieldDescription>Upload a clear photo of the renters valid ID.</FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator/>
              <FieldSet>
                <FieldLegend>Delivery Details</FieldLegend>
                <FieldDescription>The details of the delivery.</FieldDescription>
                <FieldGroup>
                  <Field>
                    <div className="flex items-center space-x-2">
                      <Switch name="is_delivery" checked={isDelivery} onCheckedChange={e => setIsDelivery(e)} />
                      <Label htmlFor="is_delivery">Delivery</Label>
                    </div>
                    <FieldDescription>Is it delivery or pick up?</FieldDescription>
                  </Field>

                  <AnimatePresence>
                    {isDelivery && (
                      <motion.div initial={{ opacity: 0 }}
                                  animate={{ opacity: 1, transition: { duration: 0.3 } }}
                                  exit={{ opacity: 0 }}>
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor="delivery_address">Delivery Address <span className="text-red-400 font-bold">*</span></FieldLabel>
                            <Input type="text" name="delivery_address" value={deliveryAddress ?? ""} onChange={e => setDeliveryAddress(e.target.value)} placeholder="e.g. Cebu City, Cebu, Philippines" required />
                            <FieldDescription>Address of the delivery.</FieldDescription>
                          </Field>

                          <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                            <Field>
                              <FieldLabel htmlFor="delivery_fee">Delivery Fee <span className="text-red-400 font-bold">*</span></FieldLabel>
                              <Input type="number" name="delivery_fee" min={0} value={deliveryFee ?? 0} onChange={e => setDeliveryFee(Number.parseInt(e.target.value))} required />
                              <FieldDescription>Fee of the delivery.</FieldDescription>
                            </Field>

                            <Field>
                              <FieldLabel htmlFor="pickup_fee">Pickup Fee <span className="text-red-400 font-bold">*</span></FieldLabel>
                              <Input type="number" name="pickup_fee" min={0} value={pickupFee ?? 0} onChange={e => setPickupFee(Number.parseInt(e.target.value))} required />
                              <FieldDescription>Fee of the pickup.</FieldDescription>
                            </Field>
                          </div>
                        </FieldGroup>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </FieldGroup>
              </FieldSet>
            </FieldSet>
          </form>
        </div>

        <DialogFooter className="space-x-2">
          <DialogClose onChange={() => setOpen(false)}>Cancel</DialogClose>
          <Button type="submit" form="add-booking-form">
            Save{" "}{loading && <Loader2 className="animate-spin"/>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}