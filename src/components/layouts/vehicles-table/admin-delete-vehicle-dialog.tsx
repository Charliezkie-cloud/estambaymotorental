import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { VehicleRow } from "@/types/models.types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { deleteVehicle } from "@/lib/supabase/tables/vehicles-tables";

type Props = {
  row?: VehicleRow;
  onRowDelete: (e: VehicleRow | null) => void;
  onCancel: () => void;
};

export default function AdminDeleteVehicleDialog({ row, onRowDelete, onCancel }: Props) {
  // States
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onConfirm() {
    if (!row) return onCancel();
    setLoading(true);

    try {
      const data = await deleteVehicle(row.id);
      toast.success("Vehicle Deleted Successfully");
      onRowDelete(data);
    } catch (error) {
      toast.error("Failed to Delete Vehicle", {
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