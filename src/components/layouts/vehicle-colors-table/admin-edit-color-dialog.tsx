import React, { useEffect, useState } from "react";
import { Loader2, Palette } from "lucide-react";
import { toast } from "sonner";

import { VehicleColorRow } from "@/types/models.types";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const isDirty = colorName.trim() !== (row?.name ?? "").trim();

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
      toast.success("Vehicle Color Updated", {
        description: `Color has been renamed to "${colorName}".`,
      });
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (row) setColorName(row.name);
  }, [row]);

  return (
    <Dialog open={!!row}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Edit Vehicle Color</DialogTitle>
              <DialogDescription className="mt-0.5">
                Update the label for this color option.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Current value chip */}
        {row && (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Current:</span>
            <Badge variant="secondary">{row.name}</Badge>
            <span className="text-muted-foreground ml-auto font-mono text-xs">ID #{row.id}</span>
          </div>
        )}

        <form onSubmit={onFormSubmit} id="edit-color-form">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit_color_name">
                  New Name <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Input
                  id="edit_color_name"
                  type="text"
                  name="edit_color_name"
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
          <DialogClose onClick={onCancel}>Cancel</DialogClose>
          <Button
            type="submit"
            form="edit-color-form"
            disabled={loading || !isDirty}
            className="min-w-20"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}