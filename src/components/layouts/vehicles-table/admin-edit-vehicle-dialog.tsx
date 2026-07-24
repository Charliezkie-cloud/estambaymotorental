import { Loader2 } from "lucide-react";
import { FilePond } from "react-filepond";
import React, { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { ActualFileObject, FilePondFile } from "filepond";
import { toast } from "sonner";

import { Database } from "@/types/database.types";
import { VehicleColorRow, VehicleRow } from "@/types/models.types";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Props = {
  supabaseClient: SupabaseClient<Database>;
  vehicleColors: VehicleColorRow[]
  row?: VehicleRow;
  onRowUpdate: (e: VehicleRow) => void;
  onCancel: () => void;
};

type MenuItem = {
  value: number;
  label: string;
};

export default function AdminEditVehicleDialog({ supabaseClient, vehicleColors, row, onRowUpdate, onCancel }: Props) {
  // Menu items
  const [vehicleColorMenuItems, setVehicleColorMenuItems] = useState<MenuItem[]>([]);
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
    e.preventDefault();
    if (!row) return;
    setLoading(true);

    const validationMessage = validateForm();
    if (typeof validationMessage === "string")
      return toast.error("Invalid Form Input", { description: validationMessage });

    try {
      let newImageFileName: string | null = null;

      if (modelImage) {
        const { error: storageDeletionError } = await supabaseClient
          .storage
          .from("vehicles")
          .remove([row.image]);

        if (storageDeletionError)
          return toast.error("Failed to Delete Vehicle Image", { description: storageDeletionError.message });

        const imageFile = modelImage[0].file;
        newImageFileName = generateFileName(imageFile);

        const { error: storageError } = await supabaseClient
          .storage
          .from("vehicles")
          .upload(newImageFileName, imageFile, {
            cacheControl: "3600",
            upsert: false
          });

        if (storageError)
          return toast.error("Failed to Upload Vehicle Image", { description: storageError.message });
      }

      const { data, error } = await supabaseClient
        .from("vehicles")
        .update({
          model: model ?? "",
          color: color ?? -1,
          year_model: yearModel ?? new Date().getFullYear(),
          daily_price: dailyPrice ?? 0.00,
          half_day_price: halfDayPrice ?? 0.00,
          hourly_price: hourlyPrice ?? 0.00,
          status: status ?? 1,
          ...(newImageFileName && { image: newImageFileName })
        })
        .eq("id", row.id)
        .select("*, vehicle_colors(name)")
        .single();

      if (error)
        return toast.error("Failed to Update Vehicle Row", { description: error.message });

      toast.success("Vehicle Updated Successfully");
      onRowUpdate(data);
    } finally {
      setLoading(false);
    }
  }

  // Helpers
  function validateForm() {
    if (status && status < 1) return "Status is required.";
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

  useEffect(() => {
    function loadFormStates() {
      if (!row) return;

      setModel(row.model);
      setColor(row.color);
      setYearModel(row.year_model);
      setDailyPrice(row.daily_price);
      setHalfDayPrice(row.half_day_price);
      setHourlyPrice(row.hourly_price);
    }

    loadFormStates();
  }, [row]);

  return (
    <Dialog open={!!row}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription>Edit {row?.model} vehicle.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[75vh]">
          <form id="edit-vehicle-form" onSubmit={onFormSubmit}>
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
                            <SelectItem key={`edit-vehicle-color-item-${item.value}`} value={item.value}>
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
                  <FieldLabel htmlFor="vehicle_image">Image</FieldLabel>
                  <FilePond name="vehicle_image"
                            onupdatefiles={setModelImage}
                            allowMultiple={false}
                            acceptedFileTypes={["image/*"]}
                            maxFileSize="10MB"
                            allowFileTypeValidation
                            allowFileSizeValidation
                            className="filepond--dark" />
                  <FieldDescription>Leave empty to keep the current image.</FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </div>


        <DialogFooter className="space-x-2">
          <DialogClose onClick={onCancel}>Cancel</DialogClose>
          <Button type="submit" form="edit-vehicle-form" disabled={loading}>
            Save Changes{" "}{loading && (<Loader2 className="animate-spin" />)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}