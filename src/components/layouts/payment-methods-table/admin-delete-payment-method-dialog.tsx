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
import { PaymentMethodRow } from "@/types/models.types";
import { useState } from "react";
import { toast } from "sonner";
import { deletePaymentMethod } from "@/lib/supabase/tables/payment-methods-table";

type Props = {
  row?: PaymentMethodRow;
  onRowDelete: (e: PaymentMethodRow | null) => void;
  onCancel: () => void;
};

export default function AdminDeletePaymentMethodDialog({ row, onRowDelete, onCancel }: Props) {
  // States
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onConfirm() {
    if (!row) return;

    setLoading(true);

    try {
      const data = await deletePaymentMethod(row.id);
      toast.success("Payment Method Deleted Successfully");
      onRowDelete(data);
    } catch (error) {
      toast.error("Failed to Delete Payment Method", {
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