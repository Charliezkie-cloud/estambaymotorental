import Image from "next/image";
import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import { ExternalLinkIcon } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VehicleRow } from "@/types/models.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  row?: VehicleRow;
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

export default function AdminDetailsVehicleDialog({ row, onClose }: Props) {
  // States
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  // Formats
  const dailyPrice = row?.daily_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
  const halfDayPrice = row?.half_day_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
  const hourlyPrice = row?.hourly_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

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
            <DialogTitle>Vehicle Details</DialogTitle>
            <DialogDescription>
              Viewing details for <span className="font-medium text-foreground">{row?.model ?? "vehicle"}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] pe-1">
            <div className="space-y-5">

              {/* — Unit Info — */}
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Unit Info</p>
                <Separator />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <DetailField label="Model">
                  {row ? <span>{row.model}</span> : <Skeleton className="h-5 w-28" />}
                </DetailField>

                <DetailField label="Year Model">
                  {row ? <span>{row.year_model}</span> : <Skeleton className="h-5 w-16" />}
                </DetailField>

                <DetailField label="Color">
                  {row ? (
                    <span>{row.vehicle_colors?.name ?? "—"}</span>
                  ) : (
                    <Skeleton className="h-5 w-20" />
                  )}
                </DetailField>

                <DetailField label="Status">
                  {!row && <Skeleton className="h-5 w-24" />}
                  {row?.status === 1 && <Badge variant="secondary">Available</Badge>}
                  {row?.status === 2 && <Badge variant="destructive">Under Maintenance</Badge>}
                </DetailField>
              </div>

              {/* — Pricing — */}
              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pricing</p>
                <Separator />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Daily</p>
                  {row ? (
                    <p className="text-lg font-semibold tabular-nums">{dailyPrice}</p>
                  ) : (
                    <Skeleton className="h-7 w-24" />
                  )}
                  <p className="text-xs text-muted-foreground">per 24 hours</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Half Day</p>
                  {row ? (
                    <p className="text-lg font-semibold tabular-nums">{halfDayPrice}</p>
                  ) : (
                    <Skeleton className="h-7 w-24" />
                  )}
                  <p className="text-xs text-muted-foreground">up to 12 hours</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Hourly</p>
                  {row ? (
                    <p className="text-lg font-semibold tabular-nums">{hourlyPrice}</p>
                  ) : (
                    <Skeleton className="h-7 w-20" />
                  )}
                  <p className="text-xs text-muted-foreground">per hour</p>
                </div>
              </div>

              {/* — Photo — */}
              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Photo</p>
                <Separator />
              </div>

              {row ? (
                <div
                  className="group relative w-full aspect-video rounded-xl overflow-hidden border border-border cursor-pointer"
                  onClick={() => setImagePreview(row.imageUrl)}
                >
                  <Image
                    src={row.imageUrl ?? ""}
                    alt={`${row.model} image`}
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

          <DialogFooter className="pt-2 border-t border-border">
            <DialogClose onClick={onClose}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}