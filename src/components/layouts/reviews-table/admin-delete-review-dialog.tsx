import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ReviewsRow } from "@/types/models.types";
import { deleteReview } from "@/lib/supabase/tables/reviews-table";

type Props = {
  row?: ReviewsRow;
  onRowDelete: (e: ReviewsRow | null) => void;
  onCancel: () => void;
};

export default function AdminDeleteReviewDialog({ row, onRowDelete, onCancel }: Props) {
  const [loading, setLoading] = useState(false);

  async function onConfirm() {
    if (!row) return onCancel();
    setLoading(true);

    try {
      const data = await deleteReview(row.id);
      toast.success("Review Deleted Successfully");
      onRowDelete(data);
    } catch (error) {
      toast.error("Failed to Delete Review", {
        description: error instanceof Error ? error.message : String(error),
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
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the review
            {row ? ` from "${row.reviewer_name}"` : ""} from the server.
          </AlertDialogDescription>
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
