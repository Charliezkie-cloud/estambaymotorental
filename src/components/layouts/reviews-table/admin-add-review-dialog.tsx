import { Loader2, MessageSquarePlus, PlusIcon, Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ReviewsRow } from "@/types/models.types";
import { createReview } from "@/lib/supabase/tables/reviews-table";

type Props = {
  onRowAdd: (e: ReviewsRow | null) => void;
};

export default function AdminAddReviewDialog({ onRowAdd }: Props) {
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      const data = await createReview({
        reviewerName: reviewerName.trim(),
        rating,
        comment: comment.trim(),
        isPublished,
      });
      toast.success("Review Added", {
        description: `Review from "${reviewerName.trim()}" has been added successfully.`,
      });
      setOpen(false);
      onRowAdd(data);
    } catch (error) {
      toast.error("Failed to Add Review", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function resetForm() {
      if (!open) return;
      setReviewerName("");
      setRating(5);
      setComment("");
      setIsPublished(false);
    }
    resetForm();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1.5" onClick={() => setOpen((prev) => !prev)} />}>
        <PlusIcon className="h-4 w-4" />
        Add Review
      </DialogTrigger>

      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Review</DialogTitle>
              <DialogDescription className="mt-0.5">
                Create a customer review to display on the website.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onFormSubmit} id="add-review-form">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reviewer_name">
                  Reviewer Name <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Input
                  id="reviewer_name"
                  type="text"
                  name="reviewer_name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  autoComplete="off"
                  placeholder="e.g. Juan Dela Cruz"
                  required
                  autoFocus
                />
                <FieldDescription>Name shown publicly with the review.</FieldDescription>
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
                <FieldDescription>Select a rating from 1 to 5 stars.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="review_comment">
                  Comment <span className="text-destructive font-bold">*</span>
                </FieldLabel>
                <Textarea
                  id="review_comment"
                  name="review_comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share the customer's feedback…"
                  required
                  rows={4}
                />
                <FieldDescription>The review body shown on the public site.</FieldDescription>
              </Field>

              <Field>
                <div className="flex items-center gap-3">
                  <Switch
                    id="is_published"
                    name="is_published"
                    checked={isPublished}
                    onCheckedChange={(checked) => setIsPublished(checked)}
                  />
                  <Label htmlFor="is_published">Publish on website</Label>
                </div>
                <FieldDescription>
                  Published reviews appear on the public website. Leave off to keep as draft.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter>
          <DialogClose onClick={() => setOpen(false)}>Cancel</DialogClose>
          <Button type="submit" form="add-review-form" disabled={loading} className="min-w-20">
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Saving…
              </>
            ) : (
              "Save Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
