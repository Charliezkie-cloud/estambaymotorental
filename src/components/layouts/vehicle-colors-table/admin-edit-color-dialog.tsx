import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { VehicleColorRow } from "@/types/models.types";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateVehicleColor } from "@/lib/supabase/tables/vehicle-colors-table";

type Props = {
  row?: VehicleColorRow;
  onRowUpdate: (e: VehicleColorRow | null) => void;
  onCancel: () => void;
};

export default function AdminEditColorDialog({ row, onRowUpdate, onCancel }: Props) {
  // States
  const [colorName, setColorName] = useState("");
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!row) return;

    e.preventDefault();
    setLoading(true);

    if (colorName.trim().length < 1) {
      toast.error("Invalid Form Input", { description: "Color name is required." });
      return setLoading(false);
    }

    try {
      const data = await updateVehicleColor(row.id, colorName);
      toast.success("Vehicle Color Updated Successfully");
      onRowUpdate(data);
    } catch (error) {
      toast.error("Failed to Update Vehicle Color", {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  }

  // Use effects
  useEffect(() => {
    function initializeName() {
      if (row)
        setColorName(row.name);
    }

    initializeName();
  }, [row]);

  return (
    <Dialog open={!!row}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Color</DialogTitle>
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
          <DialogClose onClick={onCancel}>Cancel</DialogClose>
          <Button type="submit" form="add-color-form" disabled={loading}>Save {loading && <Loader2 className="animate-spin" />}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}