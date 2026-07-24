import { SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Database } from "@/types/database.types";
import { VehicleRow } from "@/types/models.types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

type Props = {
  supabaseClient: SupabaseClient<Database>;
  row?: VehicleRow;
  onRowDelete: (e: VehicleRow) => void;
  onCancel: () => void;
};

export default function AdminDeleteVehicleDialog({ supabaseClient, row, onRowDelete, onCancel }: Props) {
  // States
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onConfirm() {
    if (!row) return onCancel();
    setLoading(true);

    try {
      const { data, error } = await supabaseClient
        .from("vehicles")
        .delete()
        .eq("id", row.id)
        .select("*, vehicle_colors(name)")
        .single();

      const { error: storageError } = await supabaseClient
        .storage
        .from("vehicles")
        .remove([row.image]);

      if (storageError)
        return toast.error("Failed to Delete Vehicle Image", { description: storageError.message });

      if (error)
        return toast.error("Failed to Delete Vehicle", { description: error.message });

      toast.success("Vehicle Deleted Successfully");
      onRowDelete(data);
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