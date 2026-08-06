import { Loader2, PlusIcon } from "lucide-react";
import { FilePondFile } from "filepond";
import React, { useMemo, useState } from "react";
import { FilePond } from "react-filepond";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VehicleColorRow, VehicleRow } from "@/types/models.types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createVehicle } from "@/lib/supabase/tables/vehicles-tables";

type Props = {
  vehicleColors: VehicleColorRow[];
  onRowAdd: (e: VehicleRow | null) => void;
};

type MenuItem = {
  value: number;
  label: string;
};

const REQUIRED = <span className="text-destructive font-bold ms-0.5">*</span>;

export default function AdminAddVehicleDialog({ vehicleColors, onRowAdd }: Props) {
  // Menu items
  const vehicleColorMenuItems: MenuItem[] = useMemo(
    () => vehicleColors.map((e) => ({ value: e.id, label: e.name })),
    [vehicleColors]
  );
  const statusMenuItems: MenuItem[] = [
    { value: 1, label: "Available" },
    { value: 2, label: "Under Maintenance" },
  ];

  // States
  const [open, setOpen] = useState(false);

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
    e.preventDefault();
    setLoading(true);

    const validationMessage = validateForm();
    if (typeof validationMessage === "string") {
      toast.error("Invalid Form Input", { description: validationMessage });
      return setLoading(false);
    }

    if (!modelImage) {
      toast.error("Invalid Form Input", { description: "Image is required." });
      return setLoading(false);
    }

    try {
      const imageFile = modelImage[0].file;
      const data = await createVehicle({
        model: model ?? "",
        color: color ?? -1,
        year_model: yearModel ?? new Date().getFullYear(),
        daily_price: dailyPrice ?? 0.00,
        half_day_price: halfDayPrice ?? 0.00,
        hourly_price: hourlyPrice ?? 0.00,
        image: imageFile,
      });

      toast.success("Vehicle Added Successfully");
      setOpen(false);
      onRowAdd(data);
    } catch (error) {
      toast.error("Failed to Add Vehicle", {
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

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      // Reset form when opening
      setStatus(1);
      setModel(undefined);
      setColor(null);
      setYearModel(undefined);
      setDailyPrice(undefined);
      setHalfDayPrice(undefined);
      setHourlyPrice(undefined);
      setModelImage(null);
    }
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={(
          <Button id="add-vehicle-trigger" className="ms-auto">
            <PlusIcon className="h-4 w-4" />
            Add Vehicle
          </Button>
        )}
      />

      <DialogContent showCloseButton={false} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
          <DialogDescription>Fill in the details below to register a new vehicle to your fleet.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] pe-1">
          <form id="add-vehicle-form" onSubmit={onFormSubmit}>
            <FieldSet>
              <FieldGroup>

                {/* — Unit Info — */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Unit Info</p>
                  <Separator />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field>
                    <FieldLabel htmlFor="add-model">Model {REQUIRED}</FieldLabel>
                    <Input
                      id="add-model"
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
                    <FieldLabel htmlFor="add-year-model">Year Model {REQUIRED}</FieldLabel>
                    <Input
                      id="add-year-model"
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
                    <FieldLabel htmlFor="add-color">Color {REQUIRED}</FieldLabel>
                    <Select
                      items={vehicleColorMenuItems}
                      name="color"
                      autoComplete="off"
                      value={color}
                      onValueChange={(e) => setColor(e)}
                      required
                    >
                      <SelectTrigger id="add-color">
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger>
                        <SelectGroup>
                          {vehicleColorMenuItems.map((item) => (
                            <SelectItem key={`add-color-item-${item.value}`} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>Primary color of the unit.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="add-status">Status {REQUIRED}</FieldLabel>
                    <Select
                      items={statusMenuItems}
                      name="status"
                      autoComplete="off"
                      value={status}
                      onValueChange={(e) => setStatus(e)}
                      required
                    >
                      <SelectTrigger id="add-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger>
                        <SelectGroup>
                          {statusMenuItems.map((item) => (
                            <SelectItem key={`add-status-item-${item.value}`} value={item.value}>
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
                    <FieldLabel htmlFor="add-daily-price">Daily Price {REQUIRED}</FieldLabel>
                    <Input
                      id="add-daily-price"
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
                    <FieldDescription>Rate for a full 24-hour rental.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="add-half-day-price">Half Day Price {REQUIRED}</FieldLabel>
                    <Input
                      id="add-half-day-price"
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
                    <FieldDescription>Rate for up to 12 hours of use.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="add-hourly-price">Hourly Price {REQUIRED}</FieldLabel>
                    <Input
                      id="add-hourly-price"
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
                    <FieldDescription>Rate charged per hour.</FieldDescription>
                  </Field>
                </div>

                {/* — Photo — */}
                <div className="space-y-1 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Photo</p>
                  <Separator />
                </div>

                <Field>
                  <FieldLabel htmlFor="add-vehicle-image">Vehicle Image {REQUIRED}</FieldLabel>
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
                  <FieldDescription>Upload a clear photo of the actual unit. Max 10 MB.</FieldDescription>
                </Field>

              </FieldGroup>
            </FieldSet>
          </form>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border">
          <DialogClose onClick={() => setOpen(false)}>Cancel</DialogClose>
          <Button type="submit" form="add-vehicle-form" disabled={loading} className="min-w-[110px]">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Add Vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}