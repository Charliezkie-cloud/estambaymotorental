import { Loader2, Palette, PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
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
      toast.success("Vehicle Color Added", {
        description: `"${colorName}" has been added successfully.`,
      });
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

  // Use effects
  useEffect(() => {
    function resetForm() {
      if (!open) return;
      setColorName("");
    }
    resetForm();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1.5" onClick={() => setOpen(prev => !prev)} />}>
        <PlusIcon className="h-4 w-4" />
        Add Color
      </DialogTrigger>

      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Vehicle Color</DialogTitle>
              <DialogDescription className="mt-0.5">
                Define a new color option that can be assigned to vehicles.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onFormSubmit} id="add-color-form">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="color_name">
                  Color Name <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Input
                  id="color_name"
                  type="text"
                  name="color_name"
                  value={colorName}
                  onChange={e => setColorName(e.target.value)}
                  autoComplete="off"
                  placeholder="e.g. Red"
                  required
                  autoFocus
                />
                <FieldDescription>
                  Enter a descriptive label for this color (e.g.&nbsp;"Black", "Red").
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter>
          <DialogClose onClick={() => setOpen(false)}>
            Cancel
          </DialogClose>
          <Button type="submit" form="add-color-form" disabled={loading} className="min-w-20">
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Saving…
              </>
            ) : (
              "Save Color"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}