import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { BookingRow } from "@/types/models.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { toast } from "sonner";
import { deleteFromBucket, DRIVERS_LICENSE_BUCKET, IDS_BUCKET, RECEIPTS_BUCKET } from "@/lib/storage-helpers";
import { SELECT_BOOKING_QUERY } from "@/lib/table-helpers";

type Props = {
  row?: BookingRow;
  supabaseClient: SupabaseClient<Database>;
  onCancel: () => void;
  onDelete: (e: BookingRow) => void;
};

export default function AdminDeleteBookingDialog({ row, supabaseClient, onCancel, onDelete }: Props) {
  // States
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onConfirm() {
    if (!row) return;

    setLoading(true);

    try {
      await deleteFromBucket(RECEIPTS_BUCKET, [row.payment_receipt_image]);
      await deleteFromBucket(DRIVERS_LICENSE_BUCKET, [row.drivers_license_image]);
      await deleteFromBucket(IDS_BUCKET, [row.valid_id_image]);

      const { data, error } = await supabaseClient
        .from("bookings")
        .delete()
        .eq("id", row.id)
        .select(SELECT_BOOKING_QUERY)
        .single();

      if (error) return toast.error("Failed to Delete Booking", { description: error.message });

      toast.success("Booking Deleted Successfully");
      onDelete(data);
    } catch (error) {
      toast.error("Something went wrong while deleting the booking", {
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