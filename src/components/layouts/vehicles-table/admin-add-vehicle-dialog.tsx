import { Loader2, PlusIcon } from "lucide-react";
import { FilePondFile } from "filepond";
import React, { useEffect, useState } from "react";
import { FilePond } from "react-filepond";
import { toast } from "sonner";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VehicleColorRow, VehicleRow } from "@/types/models.types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createVehicle } from "@/lib/supabase/tables/vehicles-tables";

type Props = {
  vehicleColors: VehicleColorRow[];
  onRowAdd: (e: VehicleRow | null) => void;
};

type MenuItem = {
  value: number;
  label: string;
};

export default function AdminAddVehicleDialog({ vehicleColors, onRowAdd }: Props) {
  // Menu items
  const [vehicleColorMenuItems, setVehicleColorMenuItems] = useState<MenuItem[]>([]);
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
        image: imageFile
      });

      toast.success("Vehicle Added Successfully");
      setOpen(false);
      onRowAdd(data);
    } catch (error) {
      toast.error("Failed to Add Vehicle", {
        description: error instanceof Error ? error.message : String(error)
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
  useEffect(() => {
    function mapVehicleColorsRow() {
      const mappedVehicleColorRows = vehicleColors.map(e => ({
        value: e.id,
        label: e.name
      }));

      setVehicleColorMenuItems(mappedVehicleColorRows);
    }

    mapVehicleColorsRow();
  }, [vehicleColors]);

  useEffect(() => {
    function resetForm() {
      if (!open) return;

      setStatus(1);
      setModel(undefined);
      setColor(null);
      setYearModel(undefined);
      setDailyPrice(undefined);
      setHalfDayPrice(undefined);
      setHourlyPrice(undefined);
      setModelImage(null);
    }

    resetForm();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="ms-auto">
        <PlusIcon />
      </DialogTrigger>

      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
          <DialogDescription>Add a new vehicle.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[75vh]">
          <form id="add-vehicle-form" onSubmit={onFormSubmit}>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="color">Status <span className="text-red-400 font-bold">*</span></FieldLabel>
                  <Select items={statusMenuItems} name="color" autoComplete="off" value={status} onValueChange={e => setStatus(e)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Color" />
                    </SelectTrigger>

                    <SelectContent alignItemWithTrigger>
                      <SelectGroup>
                        {statusMenuItems.map(item => (
                          <SelectItem key={`add-vehicle-color-item-${item.value}`} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>Choose the status of the unit.</FieldDescription>
                </Field>

                <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                  <Field>
                    <FieldLabel htmlFor="model">Model <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <Input type="text" name="model" autoComplete="off" placeholder="e.g. ADV 160" value={model ?? ""} onChange={e => setModel(e.target.value)} required />
                    <FieldDescription>Enter the make and model of the vehicle.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="color">Color <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <Select items={vehicleColorMenuItems} name="color" autoComplete="off" value={color} onValueChange={e => setColor(e)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Color" />
                      </SelectTrigger>

                      <SelectContent alignItemWithTrigger>
                        <SelectGroup>
                          {vehicleColorMenuItems.map(item => (
                            <SelectItem key={`add-vehicle-color-item-${item.value}`} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>Choose the primary color of the unit.</FieldDescription>
                  </Field>
                </div>

                <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                  <Field>
                    <FieldLabel htmlFor="year_model">Year Model <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <Input type="number" min={0} name="year_model" autoComplete="off" placeholder="e.g. 2023" value={yearModel ?? 0} onChange={e => setYearModel(Number.parseInt(e.target.value))} required />
                    <FieldDescription>The release or manufacturing year.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="daily_price">Daily Price <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <Input type="number" min={0} name="daily_price" autoComplete="off" placeholder="e.g. 750.00" value={dailyPrice ?? 0} onChange={e => setDailyPrice(Number.parseInt(e.target.value))} required />
                    <FieldDescription>Standard rate for a full 24-hour rental.</FieldDescription>
                  </Field>
                </div>

                <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                  <Field>
                    <FieldLabel htmlFor="half_day_price">Half Day Price <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <Input type="number" min={0} name="half_day_price" autoComplete="off" placeholder="e.g. 300.00" value={halfDayPrice ?? 0} onChange={e => setHalfDayPrice(Number.parseInt(e.target.value))} required />
                    <FieldDescription>Rate for up to 12 hours of use.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="hourly_price">Hourly Price <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <Input type="number" min={0} name="hourly_price" autoComplete="off" placeholder="e.g. 100.00" value={hourlyPrice ?? 0} onChange={e => setHourlyPrice(Number.parseInt(e.target.value))} required />
                    <FieldDescription>Rate charged per hour for quick rentals.</FieldDescription>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="vehicle_image">Image <span className="text-red-400 font-bold">*</span></FieldLabel>
                  <FilePond name="vehicle_image"
                            onupdatefiles={setModelImage}
                            allowMultiple={false}
                            acceptedFileTypes={["image/*"]}
                            maxFileSize="10MB"
                            allowFileTypeValidation
                            allowFileSizeValidation
                            className="filepond--dark" />
                  <FieldDescription>Upload a clear photo of the actual unit.</FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </div>

        <DialogFooter className="space-x-2">
          <DialogClose onClick={() => setOpen(false)}>Cancel</DialogClose>
          <Button type="submit" form="add-vehicle-form" disabled={loading}>
            Save{" "}{loading && (<Loader2 className="animate-spin" />)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}