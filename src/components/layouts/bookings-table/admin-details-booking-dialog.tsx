import { BookingRow } from "@/types/models.types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import { ExternalLinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  row?: BookingRow;
  onClose: () => void;
};

interface DetailFieldProps {
  label: string;
  children: React.ReactNode;
}

function DetailField({ label, children }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

function formatTimeString(timeStr: string): string {
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return minuteStr === "00" ? `${hour} ${period}` : `${hour}:${minuteStr} ${period}`;
}

export default function AdminDetailsBookingDialog({ row, onClose }: Props) {
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  const formattedCreatedAt = row
    ? new Date(row.created_at).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    : undefined;

  const formattedRentalDate = row
    ? new Date(row.rental_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
    : undefined;

  const formattedReturnDate = row
    ? new Date(row.return_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
    : undefined;

  const formattedRentalTime = row ? formatTimeString(row.time_of_rental) : undefined;
  const formattedReturnTime = row ? formatTimeString(row.time_of_return) : undefined;

  const formattedAmount = row?.amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
  const formattedDeliveryFee = row?.delivery_fee.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
  const formattedPickupFee = row?.pickup_fee.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

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
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Viewing details for booking{" "}
              <span className="font-medium text-foreground">#{row?.id ?? "—"}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] pe-1">
            <div className="space-y-5">

              {/* — Booking Info — */}
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Booking Info</p>
                <Separator />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <DetailField label="Booking ID">
                  {row ? (
                    <span className="font-mono">#{row.id}</span>
                  ) : (
                    <Skeleton className="h-5 w-16" />
                  )}
                </DetailField>

                <DetailField label="Booked At">
                  {row ? (
                    <span>{formattedCreatedAt}</span>
                  ) : (
                    <Skeleton className="h-5 w-32" />
                  )}
                </DetailField>

                <DetailField label="Booking Status">
                  {!row && <Skeleton className="h-5 w-24" />}
                  {row?.booking_status === 1 && <Badge>Completed</Badge>}
                  {row?.booking_status === 2 && <Badge variant="outline">Change Unit</Badge>}
                  {row?.booking_status === 3 && <Badge variant="secondary">Reserved</Badge>}
                  {row?.booking_status === 4 && <Badge variant="outline">Rescheduled</Badge>}
                  {row?.booking_status === 5 && <Badge variant="destructive">Cancelled</Badge>}
                  {row?.booking_status === 6 && <Badge variant="secondary">On-Going</Badge>}
                </DetailField>

                <DetailField label="Payment Status">
                  {!row && <Skeleton className="h-5 w-24" />}
                  {row?.payment_status === 1 && <Badge>Paid</Badge>}
                  {row?.payment_status === 2 && <Badge variant="secondary">Partially Paid</Badge>}
                  {row?.payment_status === 3 && <Badge variant="outline">Pending</Badge>}
                </DetailField>
              </div>

              {/* — Rental Details — */}
              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rental Details</p>
                <Separator />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <DetailField label="Vehicle">
                  {row ? (
                    <span>
                      {row.vehicles?.model ?? "—"}
                      {row.vehicles?.vehicle_colors?.name && (
                        <span className="text-muted-foreground font-normal"> ({row.vehicles.vehicle_colors.name})</span>
                      )}
                    </span>
                  ) : (
                    <Skeleton className="h-5 w-32" />
                  )}
                </DetailField>

                <DetailField label="Number of Days">
                  {row ? (
                    <span>{row.number_of_days_rent} {row.number_of_days_rent === 1 ? "day" : "days"}</span>
                  ) : (
                    <Skeleton className="h-5 w-16" />
                  )}
                </DetailField>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <DetailField label="Rental Date">
                  {row ? <span>{formattedRentalDate}</span> : <Skeleton className="h-5 w-24" />}
                </DetailField>

                <DetailField label="Rental Time">
                  {row ? <span>{formattedRentalTime}</span> : <Skeleton className="h-5 w-20" />}
                </DetailField>

                <DetailField label="Return Date">
                  {row ? <span>{formattedReturnDate}</span> : <Skeleton className="h-5 w-24" />}
                </DetailField>

                <DetailField label="Return Time">
                  {row ? <span>{formattedReturnTime}</span> : <Skeleton className="h-5 w-20" />}
                </DetailField>
              </div>

              {/* — Customer Details — */}
              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Customer Details</p>
                <Separator />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DetailField label="Full Name">
                  {row ? <span>{row.full_name}</span> : <Skeleton className="h-5 w-32" />}
                </DetailField>

                <DetailField label="Phone Number">
                  {row ? <span>{row.phone_number}</span> : <Skeleton className="h-5 w-28" />}
                </DetailField>

                <DetailField label="Facebook Account">
                  {row ? <span>{row.facebook_account}</span> : <Skeleton className="h-5 w-28" />}
                </DetailField>

                <DetailField label="Payment Method">
                  {row ? <span>{row.payment_methods?.name ?? "—"}</span> : <Skeleton className="h-5 w-24" />}
                </DetailField>
              </div>

              {/* — Documents — */}
              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Documents</p>
                <Separator />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Driver&apos;s License</p>
                  {(row && row.drivers_license_image_url) ? (
                    <div
                      className="group relative w-full aspect-video rounded-xl overflow-hidden border border-border cursor-pointer"
                      onClick={() => setImagePreview(row.drivers_license_image_url)}
                    >
                      <Image
                        src={row.drivers_license_image_url ?? ""}
                        alt={`${row.full_name} driver's license`}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        fill
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                        <ExternalLinkIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 drop-shadow-lg" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton className="w-full aspect-video rounded-xl" />
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Valid ID</p>
                  {(row && row.valid_id_image_url) ? (
                    <div
                      className="group relative w-full aspect-video rounded-xl overflow-hidden border border-border cursor-pointer"
                      onClick={() => setImagePreview(row.valid_id_image_url)}
                    >
                      <Image
                        src={row.valid_id_image_url ?? ""}
                        alt={`${row.full_name} valid ID`}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        fill
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                        <ExternalLinkIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 drop-shadow-lg" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton className="w-full aspect-video rounded-xl" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Receipt</p>
                {(row && row.receipt_image_url) ? (
                  <div
                    className="group relative w-full aspect-video rounded-xl overflow-hidden border border-border cursor-pointer"
                    onClick={() => setImagePreview(row.receipt_image_url)}
                  >
                    <Image
                      src={row.receipt_image_url ?? ""}
                      alt={`${row.full_name} payment receipt`}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      fill
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                      <ExternalLinkIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 drop-shadow-lg" />
                    </div>
                  </div>
                ) : (
                  <Skeleton className="w-full aspect-video rounded-xl" />
                )}
              </div>

              {/* — Delivery Details — */}
              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Delivery Details</p>
                <Separator />
              </div>

              <DetailField label="Is Delivery?">
                {row ? (
                  <span>{row.is_delivery === 1 ? "Yes" : "No"}</span>
                ) : (
                  <Skeleton className="h-5 w-10" />
                )}
              </DetailField>

              {row?.is_delivery === 1 && (
                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-5">
                  <DetailField label="Delivery Address">
                    {row ? <span>{row.address_for_delivery}</span> : <Skeleton className="h-5 w-48" />}
                  </DetailField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <DetailField label="Delivery Fee">
                      {row ? <span>{formattedDeliveryFee}</span> : <Skeleton className="h-5 w-20" />}
                    </DetailField>

                    <DetailField label="Pickup Fee">
                      {row ? <span>{formattedPickupFee}</span> : <Skeleton className="h-5 w-20" />}
                    </DetailField>
                  </div>
                </div>
              )}

              {/* — Total Amount — */}
              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Amount</p>
                <Separator />
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Amount</p>
                {row ? (
                  <p className="text-lg font-semibold tabular-nums">{formattedAmount}</p>
                ) : (
                  <Skeleton className="h-7 w-28" />
                )}
                <p className="text-xs text-muted-foreground">
                  Based on {row?.number_of_days_rent ?? "—"} day(s) of rental
                  {row?.is_delivery === 1 ? " plus delivery fees" : ""}.
                </p>
              </div>

            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <DialogClose onClick={onClose}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}