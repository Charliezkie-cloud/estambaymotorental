import { Loader2 } from "lucide-react";
import { FilePond } from "react-filepond";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FilePondFile } from "filepond";
import { toast } from "sonner";

import { VehicleColorRow, VehicleRow } from "@/types/models.types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateVehicle } from "@/lib/supabase/tables/vehicles-tables";

type Props = {
  vehicleColors: VehicleColorRow[];
  row?: VehicleRow;
  onRowUpdate: (e: VehicleRow | null) => void;
  onCancel: () => void;
};

type MenuItem = {
  value: number;
  label: string;
};

const REQUIRED = <span className="text-destructive font-bold ms-0.5">*</span>;

export default function AdminEditVehicleDialog({ vehicleColors, row, onRowUpdate, onCancel }: Props) {
  // Menu items
  const vehicleColorMenuItems: MenuItem[] = useMemo(
    () => vehicleColors.map((e) => ({ value: e.id, label: e.name })),
    [vehicleColors]
  );
  const statusMenuItems: MenuItem[] = [
    { value: 1, label: "Available" },
    { value: 2, label: "Under Maintenance" },
  ];

  // Form states
  const [status, setStatus] = useState<number | null>(1);
  const [model, setModel] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<number | null>(null);
  const [yearModel, setYearModel] = useState<number | undefined>(undefined);
  const [dailyPrice, setDailyPrice] = useState<number | undefined>(undefined);
  const [halfDayPrice, setHalfDayPrice] = useState<number | undefined>(undefined);
  const [hourlyPrice, setHourlyPrice] = useState<number | undefined>(undefined);
  const [modelImage, setModelImage] = useState<FilePondFile[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!row) return;

    e.preventDefault();
    setLoading(true);

    const validationMessage = validateForm();
    if (typeof validationMessage === "string") {
      toast.error("Invalid Form Input", { description: validationMessage });
      return setLoading(false);
    }

    try {
      const data = await updateVehicle({
        id: row.id,
        model: model ?? "",
        color: color ?? -1,
        year_model: yearModel ?? new Date().getFullYear(),
        daily_price: dailyPrice ?? 0.00,
        half_day_price: halfDayPrice ?? 0.00,
        hourly_price: hourlyPrice ?? 0.00,
        status: status ?? 1,
        oldImage: row.image,
        ...(modelImage && { newImage: modelImage[0].file }),
      });

      toast.success("Vehicle Updated Successfully");
      onRowUpdate(data);
    } catch (error) {
      toast.error("Failed to Update Vehicle", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  // Helpers
  function validateForm() {
    if (model && model.trim().length < 1) return "Model is required.";
    if (status && status < 1) return "Status is required.";
    if (color && color < 0) return "Color is required.";
    if (dailyPrice && dailyPrice < 0) return "Daily price cannot be negative.";
    if (halfDayPrice && halfDayPrice < 0) return "Half day price cannot be negative.";
    if (hourlyPrice && hourlyPrice < 0) return "Hourly price cannot be negative.";
    return false;
  }

  // Use effects
  const prevRowRef = useRef<VehicleRow | undefined>(undefined);
  useEffect(() => {
    if (!row || row === prevRowRef.current) return;
    prevRowRef.current = row;
    // Defer to avoid synchronous setState-in-effect
    const timer = setTimeout(() => {
      setModel(row.model);
      setColor(row.color);
      setStatus(row.status);
      setYearModel(row.year_model);
      setDailyPrice(row.daily_price);
      setHalfDayPrice(row.half_day_price);
      setHourlyPrice(row.hourly_price);
      setModelImage(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [row]);

  return (
    <Dialog open={!!row}>
      <DialogContent showCloseButton={false} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription>
            Editing <span className="font-medium text-foreground">{row?.model ?? "vehicle"}</span>. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] pe-1">
          <form id="edit-vehicle-form" onSubmit={onFormSubmit}>
            <FieldSet>
              <FieldGroup>

                {/* — Unit Info — */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Unit Info</p>
                  <Separator />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field>
                    <FieldLabel htmlFor="edit-model">Model {REQUIRED}</FieldLabel>
                    <Input
                      id="edit-model"
                      type="text"
                      name="model"
                      autoComplete="off"
                      placeholder="e.g. Honda ADV 160"
                      value={model ?? ""}
                      onChange={(e) => setModel(e.target.value)}
                      required
                    />
                    <FieldDescription>Make and model of the vehicle.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-year-model">Year Model {REQUIRED}</FieldLabel>
                    <Input
                      id="edit-year-model"
                      type="number"
                      min={1900}
                      max={new Date().getFullYear() + 1}
                      name="year_model"
                      autoComplete="off"
                      placeholder={`e.g. ${new Date().getFullYear()}`}
                      value={yearModel ?? ""}
                      onChange={(e) => setYearModel(Number.parseInt(e.target.value))}
                      required
                    />
                    <FieldDescription>Release or manufacturing year.</FieldDescription>
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field>
                    <FieldLabel htmlFor="edit-color">Color {REQUIRED}</FieldLabel>
                    <Select
                      items={vehicleColorMenuItems}
                      name="color"
                      autoComplete="off"
                      value={color}
                      onValueChange={(e) => setColor(e)}
                      required
                    >
                      <SelectTrigger id="edit-color">
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger>
                        <SelectGroup>
                          {vehicleColorMenuItems.map((item) => (
                            <SelectItem key={`edit-color-item-${item.value}`} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>Primary color of the unit.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-status">Status {REQUIRED}</FieldLabel>
                    <Select
                      items={statusMenuItems}
                      name="status"
                      autoComplete="off"
                      value={status}
                      onValueChange={(e) => setStatus(e)}
                      required
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger>
                        <SelectGroup>
                          {statusMenuItems.map((item) => (
                            <SelectItem key={`edit-status-item-${item.value}`} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>Current availability of the unit.</FieldDescription>
                  </Field>
                </div>

                {/* — Pricing — */}
                <div className="space-y-1 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pricing</p>
                  <Separator />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Field>
                    <FieldLabel htmlFor="edit-daily-price">Daily Price {REQUIRED}</FieldLabel>
                    <Input
                      id="edit-daily-price"
                      type="number"
                      min={0}
                      step="0.01"
                      name="daily_price"
                      autoComplete="off"
                      placeholder="750.00"
                      value={dailyPrice ?? ""}
                      onChange={(e) => setDailyPrice(Number.parseFloat(e.target.value))}
                      required
                    />
                    <FieldDescription>Rate for 24 hours.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-half-day-price">Half Day Price {REQUIRED}</FieldLabel>
                    <Input
                      id="edit-half-day-price"
                      type="number"
                      min={0}
                      step="0.01"
                      name="half_day_price"
                      autoComplete="off"
                      placeholder="400.00"
                      value={halfDayPrice ?? ""}
                      onChange={(e) => setHalfDayPrice(Number.parseFloat(e.target.value))}
                      required
                    />
                    <FieldDescription>Rate for up to 12 hours.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-hourly-price">Hourly Price {REQUIRED}</FieldLabel>
                    <Input
                      id="edit-hourly-price"
                      type="number"
                      min={0}
                      step="0.01"
                      name="hourly_price"
                      autoComplete="off"
                      placeholder="100.00"
                      value={hourlyPrice ?? ""}
                      onChange={(e) => setHourlyPrice(Number.parseFloat(e.target.value))}
                      required
                    />
                    <FieldDescription>Rate per hour.</FieldDescription>
                  </Field>
                </div>

                {/* — Photo — */}
                <div className="space-y-1 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Photo</p>
                  <Separator />
                </div>

                <Field>
                  <FieldLabel htmlFor="edit-vehicle-image">Replace Image</FieldLabel>
                  <FilePond
                    name="vehicle_image"
                    onupdatefiles={setModelImage}
                    allowMultiple={false}
                    acceptedFileTypes={["image/*"]}
                    maxFileSize="10MB"
                    allowFileTypeValidation
                    allowFileSizeValidation
                    className="filepond--dark"
                  />
                  <FieldDescription>Leave empty to keep the current image. Max 10 MB.</FieldDescription>
                </Field>

              </FieldGroup>
            </FieldSet>
          </form>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border">
          <DialogClose onClick={onCancel}>Cancel</DialogClose>
          <Button type="submit" form="edit-vehicle-form" disabled={loading} className="min-w-[120px]">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}