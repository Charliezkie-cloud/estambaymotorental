import { Loader2, PlusIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VehicleColorRow } from "@/types/models.types";
import { createVehicleColor } from "@/lib/supabase/tables/vehicle-colors-table";

type Props = {
  onRowAdd: (e: VehicleColorRow | null) => void;
};

export default function AdminAddColorDialog({ onRowAdd }: Props) {
  // States
  const [colorName, setColorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Handlers
  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    if (colorName.trim().length < 1) {
      toast.error("Invalid Form Input", { description: "Color name is required." });
      return setLoading(false);
    }

    try {
      const data = await createVehicleColor(colorName);
      toast.success("Vehicle Color Added Successfully");
      setOpen(false);
      onRowAdd(data);
    }  catch (error) {
      toast.error("Failed to Add Vehicle Color", {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="ms-auto" onClick={() => setOpen(prev => !prev)}>
        <PlusIcon />
      </DialogTrigger>

      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add Color</DialogTitle>
          <DialogDescription>Add a new color for vehicles.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onFormSubmit} id="add-color-form">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="color_name">Name <span className="text-red-400 font-bold">*</span></FieldLabel>
                <Input type="text" name="color_name" value={colorName} onChange={e => setColorName(e.target.value)} autoComplete="off" placeholder="e.g. Red" required />
                <FieldDescription>Enter a label for this color option.</FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
        <DialogFooter className="space-x-2">
          <DialogClose onClick={() => setOpen(false)}>Cancel</DialogClose>
          <Button type="submit" form="add-color-form" disabled={loading}>Save {loading && <Loader2 className="animate-spin" />}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}