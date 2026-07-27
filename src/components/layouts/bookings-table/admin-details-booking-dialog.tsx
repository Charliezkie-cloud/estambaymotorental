import { BookingRow } from "@/types/models.types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";

type Props = {
  row?: BookingRow;
  onClose: () => void;
};

export default function AdminDetailsBookingDialog({ row, onClose }: Props) {
  // States
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  // Constants
  const formattedRentalDate = row && new Date(row.rental_date).toLocaleDateString("en-PH", {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedRentalTime = row && formatTimeString(row.time_of_rental);
  const formattedReturnDate = row && new Date(row.return_date).toLocaleDateString("en-PH", {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedReturnTime = row && formatTimeString(row.time_of_return);

  // Helpers
  function formatTimeString(timeStr: string): string {
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12 || 12;
    return minuteStr === '00' ? `${hour} ${period}` : `${hour}:${minuteStr} ${period}`;
  }

  return (
    <>
      {imagePreview && (
        <Lightbox open={!!imagePreview}
                  close={() => setImagePreview(undefined)}
                  slides={[
                    { src: imagePreview }
                  ]} />
      )}

      <Dialog open={!!row}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>The details of the Booking.</DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[75vh] pe-2">
            <div className="space-y-7">

              <hr/>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Rental Details</h2>
                <p className="text-muted-foreground text-sm">The details of the rental.</p>
              </div>

              <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                <div className="space-y-1">
                  <h3 className="font-semibold">Vehicle</h3>
                  <hr/>
                  <div>{row ? <p>{row.vehicles?.model}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold">Vehicle Color</h3>
                  <hr/>
                  <div>{row ? <p>{row.vehicles?.vehicle_colors?.name}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">Number of Rent Days</h3>
                <hr/>
                <div>{row ? <p>{row.number_of_days_rent} Days</p> : <Skeleton className="w-full h-6" />}</div>
              </div>

              <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                <div className="space-y-1">
                  <h3 className="font-semibold">Rental Date</h3>
                  <hr/>
                  <div>{row ? <p>{formattedRentalDate}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold">Rental Time</h3>
                  <hr/>
                  <div>{row ? <p>{formattedRentalTime}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>
              </div>

              <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                <div className="space-y-1">
                  <h3 className="font-semibold">Return Date</h3>
                  <hr/>
                  <div>{row ? <p>{formattedReturnDate}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold">Return Time</h3>
                  <hr/>
                  <div>{row ? <p>{formattedReturnTime}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Renters Details</h2>
                <p className="text-muted-foreground text-sm">The details of the renter.</p>
              </div>

              <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                <div className="space-y-1">
                  <h3 className="font-semibold">Full Name</h3>
                  <hr/>
                  <div>{row ? <p>{row.full_name}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold">Phone Number</h3>
                  <hr/>
                  <div>{row ? <p>{row.phone_number}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>
              </div>

              <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                <div className="space-y-1">
                  <h3 className="font-semibold">Facebook Account</h3>
                  <hr/>
                  <div>{row ? <p>{row.facebook_account}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold">Payment Method</h3>
                  <hr/>
                  <div>{row ? <p>{row.payment_method}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>
              </div>

              <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                <div className="space-y-1">
                  <h3 className="font-semibold">Drivers License Image</h3>
                  <p className="text-muted-foreground text-sm">Click the image to full screen view.</p>
                  <hr/>
                  {(row && row.drivers_license_image_url) ? (
                    <div className="relative w-full h-[150px]">
                      <Image src={row.drivers_license_image_url ?? ""}
                             alt={`${row.full_name} Drivers License Image`}
                             className="object-cover rounded-xl cursor-pointer"
                             onClick={() => setImagePreview(row.drivers_license_image_url)}
                             loading="lazy"
                             fill unoptimized />
                    </div>
                  ) : (
                    <Skeleton className="w-full h-[150px]" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold">Valid ID Image</h3>
                  <p className="text-muted-foreground text-sm">Click the image to full screen view.</p>
                  <hr/>
                  {(row && row.valid_id_image_url) ? (
                    <div className="relative w-full h-[150px]">
                      <Image src={row.valid_id_image_url ?? ""}
                             alt={`${row.full_name} Valid ID Image`}
                             className="object-cover rounded-xl cursor-pointer"
                             onClick={() => setImagePreview(row.valid_id_image_url)}
                             loading="lazy"
                             fill unoptimized />
                    </div>
                  ) : (
                    <Skeleton className="w-full h-[150px]" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">Receipt Image</h3>
                <p className="text-muted-foreground text-sm">Click the image to full screen view.</p>
                <hr/>
                {(row && row.receipt_image_url) ? (
                  <div className="relative w-full h-[250px]">
                    <Image src={row.receipt_image_url ?? ""}
                           alt={`${row.full_name} Receipt Image`}
                           className="object-cover rounded-xl cursor-pointer"
                           onClick={() => setImagePreview(row.receipt_image_url)}
                           loading="lazy"
                           fill unoptimized />
                  </div>
                ) : (
                  <Skeleton className="w-full h-[250px]" />
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Delivery Details</h2>
                <p className="text-muted-foreground text-sm">The delivery details of the booking.</p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold">Is Delivery?</h3>
                <hr/>
                <div>{row ? <p>{row.is_delivery === 1 ? "Yes" : "No"}</p> : <Skeleton className="w-full h-6" />}</div>
              </div>

              {(row && row.is_delivery === 1) && (
                <>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Delivery Address</h3>
                    <hr/>
                    <div>{row ? <p>{row.address_for_delivery}</p> : <Skeleton className="w-full h-6" />}</div>
                  </div>

                  <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                    <div className="space-y-1">
                      <h3 className="font-semibold">Delivery Fee</h3>
                      <hr/>
                      <div>{row ? <p>{row.delivery_fee.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p> : <Skeleton className="w-full h-6" />}</div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-semibold">Pickup Fee</h3>
                      <hr/>
                      <div>{row ? <p>{row.pickup_fee.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p> : <Skeleton className="w-full h-6" />}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <DialogClose onClick={onClose}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}