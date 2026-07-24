import { SupabaseClient } from "@supabase/supabase-js";
import { Loader2, PlusIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VehicleColorRow } from "@/types/models.types";

type Props = {
  supabaseClient: SupabaseClient;
  onRowAdd?: (e: VehicleColorRow) => void;
};

export default function AdminAddColorDialog({ supabaseClient, onRowAdd = () => { } }: Props) {
  // States
  const [colorName, setColorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Handlers
  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabaseClient
        .from("vehicle_colors")
        .insert({ name: colorName })
        .select("*")
        .single();

      if (error)
        return toast.error("Failed to Add Vehicle Color", { description: error.message });

      toast.success("Vehicle Color Added Successfully");
      setOpen(false);
      onRowAdd(data);
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