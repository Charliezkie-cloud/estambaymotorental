import Image from "next/image";
import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VehicleRow } from "@/types/models.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type Props = {
  row?: VehicleRow;
  onClose: () => void;
};

export default function AdminDetailsVehicleDialog({ row, onClose }: Props) {
  // States
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  // Formats
  const dailyPrice = row && row.daily_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
  const halfDayPrice = row && row.half_day_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
  const hourlyPrice = row && row.hourly_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

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
            <DialogTitle>Vehicle Details</DialogTitle>
            <DialogDescription>The details of {row?.model ?? "Vehicle."}</DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[75vh]">

            <div className="space-y-7">
              <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                <div className="space-y-1">
                  <h2 className="font-semibold">Model</h2>
                  <hr/>
                  <div>{row ? <p>{row.model}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>

                <div className="space-y-1">
                  <h2 className="font-semibold">Year Model</h2>
                  <hr/>
                  <div>{row ? <p>{row.year_model}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>
              </div>

              <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                <div className="space-y-1">
                  <h2 className="font-semibold">Color</h2>
                  <hr/>
                  <div>{row ? <p>{row.vehicle_colors.name}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>

                <div className="space-y-1">
                  <h2 className="font-semibold">Daily Price</h2>
                  <hr/>
                  <div>{row ? <p>{dailyPrice}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>
              </div>

              <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                <div className="space-y-1">
                  <h2 className="font-semibold">Half Day Price</h2>
                  <hr/>
                  <div>{row ? <p>{halfDayPrice}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>

                <div className="space-y-1">
                  <h2 className="font-semibold">Hourly Price</h2>
                  <hr/>
                  <div>{row ? <p>{hourlyPrice}</p> : <Skeleton className="w-full h-6" />}</div>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="font-semibold">Status</h2>
                <hr/>
                {!row && <Skeleton className="w-full h-6" />}
                {row && row.status === 1 ? (
                  <Badge variant="secondary">Available</Badge>
                ) : (
                  <Badge variant="destructive">Under Maintenance</Badge>
                )}
              </div>

              <div className="space-y-1">
                <h2 className="font-semibold">Image</h2>
                <p className="text-muted-foreground text-sm">Click the image to full screen view.</p>
                <hr/>
                {row ? (
                  <div className="relative w-full h-[500px]">
                    <Image src={row.imageUrl ?? ""}
                           alt={`${row.model} Image`}
                           className="object-cover rounded-xl cursor-pointer"
                           onClick={() => setImagePreview(row.imageUrl)}
                           loading="lazy"
                           fill unoptimized />
                  </div>
                ) : (
                  <Skeleton className="w-full h-[500px]" />
                )}
              </div>
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