import React, { useEffect, useState } from "react";
import { Loader2, MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";

import { ReviewsRow } from "@/types/models.types";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateReview } from "@/lib/supabase/tables/reviews-table";

type Props = {
  row?: ReviewsRow;
  onRowUpdate: (e: ReviewsRow | null) => void;
  onCancel: () => void;
};

export default function AdminEditReviewDialog({ row, onRowUpdate, onCancel }: Props) {
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDirty =
    reviewerName.trim() !== (row?.reviewer_name ?? "").trim() ||
    rating !== (row?.rating ?? 5) ||
    comment.trim() !== (row?.comment ?? "").trim() ||
    isPublished !== (row?.is_published === 1);

  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!row) return;

    e.preventDefault();
    setLoading(true);

    if (reviewerName.trim().length < 1) {
      toast.error("Invalid Form Input", { description: "Reviewer name is required." });
      return setLoading(false);
    }

    if (comment.trim().length < 1) {
      toast.error("Invalid Form Input", { description: "Comment is required." });
      return setLoading(false);
    }

    if (rating < 1 || rating > 5) {
      toast.error("Invalid Form Input", { description: "Rating must be between 1 and 5." });
      return setLoading(false);
    }

    try {
      const data = await updateReview({
        id: row.id,
        reviewerName: reviewerName.trim(),
        rating,
        comment: comment.trim(),
        isPublished,
      });
      toast.success("Review Updated", {
        description: `Review from "${reviewerName.trim()}" has been updated.`,
      });
      onRowUpdate(data);
    } catch (error) {
      toast.error("Failed to Update Review", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (row) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReviewerName(row.reviewer_name);
      setRating(row.rating);
      setComment(row.comment);
      setIsPublished(row.is_published === 1);
    }
  }, [row]);

  return (
    <Dialog open={!!row}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Edit Review</DialogTitle>
              <DialogDescription className="mt-0.5">
                Update review details and publish status.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {row && (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Current:</span>
            <Badge variant="secondary">{row.reviewer_name}</Badge>
            <span className="text-muted-foreground ml-auto font-mono text-xs">ID #{row.id}</span>
          </div>
        )}

        <form onSubmit={onFormSubmit} id="edit-review-form">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit_reviewer_name">
                  Reviewer Name <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Input
                  id="edit_reviewer_name"
                  type="text"
                  name="edit_reviewer_name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  autoComplete="off"
                  placeholder="e.g. Juan Dela Cruz"
                  required
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel>
                  Rating <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded-md p-1.5 transition-colors hover:bg-muted"
                      aria-label={`Rate ${value} star${value !== 1 ? "s" : ""}`}
                      aria-pressed={rating === value}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          value <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="edit_review_comment">
                  Comment <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Textarea
                  id="edit_review_comment"
                  name="edit_review_comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share the customer's feedback…"
                  required
                  rows={4}
                />
              </Field>

              <Field>
                <div className="flex items-center gap-3">
                  <Switch
                    id="edit_is_published"
                    name="edit_is_published"
                    checked={isPublished}
                    onCheckedChange={(checked) => setIsPublished(checked)}
                  />
                  <Label htmlFor="edit_is_published">Publish on website</Label>
                </div>
                <FieldDescription>
                  Toggle to show or hide this review on the public website.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter>
          <DialogClose onClick={onCancel}>Cancel</DialogClose>
          <Button
            type="submit"
            form="edit-review-form"
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
