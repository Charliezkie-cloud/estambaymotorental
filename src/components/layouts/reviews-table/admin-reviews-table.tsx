"use client";

import { toast } from "sonner";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontalIcon,
  MessageSquare,
  Search,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminAddReviewDialog from "@/components/layouts/reviews-table/admin-add-review-dialog";
import { ReviewsRow } from "@/types/models.types";
import { Button } from "@/components/ui/button";
import AdminDeleteReviewDialog from "@/components/layouts/reviews-table/admin-delete-review-dialog";
import AdminEditReviewDialog from "@/components/layouts/reviews-table/admin-edit-review-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { getAllReviews, setReviewPublished } from "@/lib/supabase/tables/reviews-table";

type SortField = "id" | "reviewer_name" | "rating" | "created_at" | "is_published";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-3.5 w-3.5 ${
            value <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsTable() {
  const [reviews, setReviews] = useState<ReviewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [deleteRow, setDeleteRow] = useState<ReviewsRow | undefined>(undefined);
  const [updateRow, setUpdateRow] = useState<ReviewsRow | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "created_at", direction: "desc" });

  function onRowAdd(row: ReviewsRow | null) {
    if (!row) return;
    setReviews((prev) => [row, ...prev]);
  }

  function onRowDelete(row: ReviewsRow | null) {
    setDeleteRow(undefined);
    if (!row) return;
    setReviews((prev) => prev.filter((e) => e.id !== row.id));
  }

  function onRowUpdate(row: ReviewsRow | null) {
    setUpdateRow(undefined);
    if (!row) return;
    setReviews((prev) => prev.map((e) => (e.id === row.id ? row : e)));
  }

  async function onPublishedToggle(row: ReviewsRow, nextPublished: boolean) {
    setPublishingId(row.id);

    try {
      const data = await setReviewPublished(row.id, nextPublished);
      if (!data) return;

      setReviews((prev) => prev.map((e) => (e.id === data.id ? data : e)));
      toast.success(nextPublished ? "Review Published" : "Review Unpublished", {
        description: nextPublished
          ? `"${row.reviewer_name}" is now visible on the website.`
          : `"${row.reviewer_name}" is hidden from the website.`,
      });
    } catch (error) {
      toast.error("Failed to Update Publish Status", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setPublishingId(null);
    }
  }

  function handleSortToggle(field: SortField) {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "asc" };
    });
  }

  const filteredAndSorted = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = reviews.filter(
      (r) =>
        query === "" ||
        r.reviewer_name.toLowerCase().includes(query) ||
        r.comment.toLowerCase().includes(query) ||
        String(r.id).includes(query) ||
        String(r.rating).includes(query),
    );

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sort.field === "id") {
        cmp = a.id - b.id;
      } else if (sort.field === "reviewer_name") {
        cmp = a.reviewer_name.localeCompare(b.reviewer_name);
      } else if (sort.field === "rating") {
        cmp = a.rating - b.rating;
      } else if (sort.field === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sort.field === "is_published") {
        cmp = (a.is_published ?? 0) - (b.is_published ?? 0);
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });

    return result;
  }, [reviews, searchQuery, sort]);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);

      try {
        const data = await getAllReviews();
        setReviews(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Reviews", {
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  function SortIcon({ field }: { field: SortField }) {
    if (sort.field !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
    return sort.direction === "asc"
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />;
  }

  return (
    <div className="space-y-4 bg-card border border-border p-5 rounded-xl">
      <AdminDeleteReviewDialog
        row={deleteRow}
        onRowDelete={onRowDelete}
        onCancel={() => setDeleteRow(undefined)}
      />
      <AdminEditReviewDialog
        row={updateRow}
        onRowUpdate={onRowUpdate}
        onCancel={() => setUpdateRow(undefined)}
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Customer Reviews</h2>
          {!loading && (
            <Badge variant="secondary" className="text-xs">
              {filteredAndSorted.length} / {reviews.length}
            </Badge>
          )}
        </div>
        <AdminAddReviewDialog onRowAdd={onRowAdd} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="reviews-search"
          type="search"
          placeholder="Search by name, comment, rating, or ID…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <button
                  onClick={() => handleSortToggle("id")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Review ID {SortIcon({ field: "id" })}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("created_at")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Created At {SortIcon({ field: "created_at" })}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("reviewer_name")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Reviewer {SortIcon({ field: "reviewer_name" })}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("rating")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Rating {SortIcon({ field: "rating" })}
                </button>
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide">Comment</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("is_published")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Published {SortIcon({ field: "is_published" })}
                </button>
              </TableHead>
              <TableHead className="text-end text-xs font-medium uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading &&
              [1, 2, 3, 4, 5].map((item) => (
                <TableRow key={`reviews-table-skeleton-${item}`}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="flex justify-end"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}

            {!loading && filteredAndSorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 opacity-30" />
                    <p className="text-sm font-medium">
                      {searchQuery ? "No reviews match your search." : "No reviews found."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredAndSorted.map((item) => {
                const formattedCreatedAt = new Date(item.created_at).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                });
                const isPublished = item.is_published === 1;

                return (
                  <TableRow key={`reviews-item-${item.id}`} className="group">
                    <TableCell className="font-mono text-sm text-muted-foreground">#{item.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formattedCreatedAt}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{item.reviewer_name}</span>
                    </TableCell>
                    <TableCell>
                      <RatingStars rating={item.rating} />
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <p className="text-sm text-muted-foreground truncate" title={item.comment}>
                        {item.comment}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          size="sm"
                          checked={isPublished}
                          disabled={publishingId === item.id}
                          onCheckedChange={(checked) => onPublishedToggle(item, checked)}
                          aria-label={isPublished ? "Unpublish review" : "Publish review"}
                        />
                        <Badge variant={isPublished ? "default" : "secondary"} className="text-xs">
                          {isPublished ? "Live" : "Draft"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-60 group-hover:opacity-100 transition-opacity"
                              id={`review-actions-${item.id}`}
                            >
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Row Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setUpdateRow(item)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onPublishedToggle(item, !isPublished)}
                              disabled={publishingId === item.id}
                            >
                              {isPublished ? "Unpublish" : "Publish"}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteRow(item)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {!loading && reviews.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filteredAndSorted.length} of {reviews.length} review
          {reviews.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
