import { toast } from "sonner";
import { SupabaseClient } from "@supabase/supabase-js"
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { VehicleColorRow } from "@/types/models.types";
import { Database } from "@/types/database.types";

type Props = {
  row?: VehicleColorRow;
  supabaseClient: SupabaseClient<Database>;
  onRowDelete: (e: VehicleColorRow) => void;
  onCancel: () => void;
};

export default function AdminDeleteColorDialog({ row, supabaseClient, onRowDelete, onCancel }: Props) {
  // States
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onConfirm() {
    if (!row) return onCancel();
    setLoading(true);

    try {
      const { data, error } = await supabaseClient
        .from("vehicle_colors")
        .delete()
        .eq("id", row.id)
        .select()
        .single();

      if (error)
        return toast.error("Failed to Delete Vehicle Color", { description: error.message });

      toast.success("Vehicle Color Added Successfully");
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