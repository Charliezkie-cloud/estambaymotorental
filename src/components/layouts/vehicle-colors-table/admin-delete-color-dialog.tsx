import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { VehicleColorRow } from "@/types/models.types";
import { deleteVehicleColor } from "@/lib/supabase/tables/vehicle-colors-table";

type Props = {
  row?: VehicleColorRow;
  onRowDelete: (e: VehicleColorRow | null) => void;
  onCancel: () => void;
};

export default function AdminDeleteColorDialog({ row, onRowDelete, onCancel }: Props) {
  // States
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onConfirm() {
    if (!row) return onCancel();
    setLoading(true);

    try {
      const data = await deleteVehicleColor(row.id);
      toast.success("Vehicle Color Added Successfully");
      onRowDelete(data);
    } catch (error) {
      toast.error("Failed to Delete Vehicle Color", {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={!!row}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone. This will permanently delete the row from the server.</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            Yes{" "}{loading && (<Loader2 className="animate-spin" />)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}