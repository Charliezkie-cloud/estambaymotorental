import { Loader2, PlusIcon } from "lucide-react";
import { ActualFileObject, FilePondFile } from "filepond";
import React, { useEffect, useState } from "react";
import { FilePond } from "react-filepond";
import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VehicleColorRow, VehicleRow } from "@/types/models.types";
import { Database } from "@/types/database.types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  supabaseClient: SupabaseClient<Database>;
  vehicleColors: VehicleColorRow[];
  onRowAdd: (e: VehicleRow) => void;
};

type VehicleColorMenuItem = {
  value: number;
  label: string;
};

export default function AdminAddVehicleDialog({ supabaseClient, vehicleColors, onRowAdd }: Props) {
  // States
  const [vehicleColorMenuItems, setVehicleColorMenuItems] = useState<VehicleColorMenuItem[]>([]);
  const [open, setOpen] = useState(false);

  // Form states
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
    if (typeof validationMessage === "string")
      return toast.error("Invalid Form Input", { description: validationMessage });

    if (!modelImage)
      return toast.error("Invalid Form Input", { description: "Image is required." });

    try {
      const imageFile = modelImage[0].file;
      const newImageFileName = generateFileName(imageFile);

      const { data, error } = await supabaseClient
        .from("vehicles")
        .insert({
          model: model ?? "",
          color: color ?? -1,
          year_model: yearModel ?? new Date().getFullYear(),
          daily_price: dailyPrice ?? 0.00,
          half_day_price: halfDayPrice ?? 0.00,
          hourly_price: hourlyPrice ?? 0.00,
          image: newImageFileName
        })
        .select("*, vehicle_colors(name)")
        .single();

      if (error)
        return toast.error("Failed to Add Vehicle", { description: error.message });

      const { error: storageError } = await supabaseClient
        .storage
        .from("vehicles")
        .upload(newImageFileName, imageFile, {
          cacheControl: "3600",
          upsert: false
        });

      if (storageError)
        return toast.error("Failed to Upload Vehicle Image", { description: storageError.message });

      toast.success("Vehicle Added Successfully");
      setOpen(false);
      onRowAdd(data);
    } finally {
      setLoading(false);
    }
  }

  // Helpers
  function validateForm() {
    if (color && color < 0) return "Color is required.";
    if (dailyPrice && dailyPrice < 0) return "Daily price cannot be negative.";
    if (halfDayPrice && halfDayPrice < 0) return "Half day price cannot be negative.";
    if (hourlyPrice && hourlyPrice < 0) return "Hourly price cannot be negative.";
    return false;
  }

  function generateFileName(file: ActualFileObject) {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const baseName = file.name
      .substring(0, file.name.lastIndexOf('.'))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const uniqueId = crypto.randomUUID();

    return `${uniqueId}-${baseName}.${fileExtension}`;
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
                    <Input type="number" name="year_model" autoComplete="off" placeholder="e.g. 2023" value={yearModel ?? ""} onChange={e => setYearModel(Number.parseInt(e.target.value))} required />
                    <FieldDescription>The release or manufacturing year.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="daily_price">Daily Price <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <Input type="number" name="daily_price" autoComplete="off" placeholder="e.g. 750.00" value={dailyPrice ?? ""} onChange={e => setDailyPrice(Number.parseInt(e.target.value))} required />
                    <FieldDescription>Standard rate for a full 24-hour rental.</FieldDescription>
                  </Field>
                </div>

                <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-7">
                  <Field>
                    <FieldLabel htmlFor="half_day_price">Half Day Price <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <Input type="number" name="half_day_price" autoComplete="off" placeholder="e.g. 300.00" value={halfDayPrice ?? ""} onChange={e => setHalfDayPrice(Number.parseInt(e.target.value))} required />
                    <FieldDescription>Rate for up to 12 hours of use.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="hourly_price">Hourly Price <span className="text-red-400 font-bold">*</span></FieldLabel>
                    <Input type="number" name="hourly_price" autoComplete="off" placeholder="e.g. 100.00" value={hourlyPrice ?? ""} onChange={e => setHourlyPrice(Number.parseInt(e.target.value))} required />
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
                            className="filepond--dark"
                            required />
                  <FieldDescription>Upload a clear photo of the actual unit.</FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </div>

        <DialogFooter className="space-x-2">
          <DialogClose onClick={() => setOpen(false)}>Cancel</DialogClose>
          <Button type="submit" form="add-vehicle-form" disabled={loading}>
            Save Changes{" "}{loading && (<Loader2 className="animate-spin" />)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}