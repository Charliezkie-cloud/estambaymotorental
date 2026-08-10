import { ReviewsRow } from "@/types/models.types";
import { supabaseClient } from "@/lib/supabase/supabase-client";

type CreateReviewParameters = {
  reviewerName: string;
  rating: number;
  comment: string;
  isPublished?: boolean;
};

type UpdateReviewParameters = {
  id: number;
  reviewerName: string;
  rating: number;
  comment: string;
  isPublished: boolean;
};

export async function getAllReviews(): Promise<ReviewsRow[] | null> {
  const { data, error } = await supabaseClient
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getPublishedReviews(): Promise<ReviewsRow[] | null> {
  const { data, error } = await supabaseClient
    .from("reviews")
    .select("*")
    .eq("is_published", 1)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createReview({
  reviewerName,
  rating,
  comment,
  isPublished = false,
}: CreateReviewParameters): Promise<ReviewsRow | null> {
  const { data, error } = await supabaseClient
    .from("reviews")
    .insert({
      reviewer_name: reviewerName,
      rating,
      comment,
      is_published: isPublished ? 1 : 0,
    })
    .select("*")
    .single();

  if (error) throw error;
  if (!data) return null;

  return data;
}

export async function updateReview({
  id,
  reviewerName,
  rating,
  comment,
  isPublished,
}: UpdateReviewParameters): Promise<ReviewsRow | null> {
  const { data, error } = await supabaseClient
    .from("reviews")
    .update({
      reviewer_name: reviewerName,
      rating,
      comment,
      is_published: isPublished ? 1 : 0,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  if (!data) return null;

  return data;
}

export async function setReviewPublished(
  id: number,
  isPublished: boolean,
): Promise<ReviewsRow | null> {
  const { data, error } = await supabaseClient
    .from("reviews")
    .update({ is_published: isPublished ? 1 : 0 })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  if (!data) return null;

  return data;
}

export async function deleteReview(id: number): Promise<ReviewsRow | null> {
  const { data, error } = await supabaseClient
    .from("reviews")
    .delete()
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  if (!data) return null;

  return data;
}
