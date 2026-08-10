"use client";

import { MessageSquareQuote, Star } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { ReviewsRow } from "@/types/models.types";

interface ReviewsSectionProps {
  reviews: ReviewsRow[];
  isLoadingReviews: boolean;
}

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`size-4 ${
            value <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-[#94A3B8]/40"
          }`}
        />
      ))}
    </div>
  );
};

export const ReviewsSection = ({
  reviews,
  isLoadingReviews,
}: ReviewsSectionProps) => {
  return (
    <section id="reviews" className="bg-[#010F1F] py-12 scroll-mt-20">
      <div className="max-w-7xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-white">
            Reviews
          </h2>
          <p className="text-[#94A3B8]">
            Read genuine stories and reviews from people who’ve traveled with us.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingReviews ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`review-skeleton-${index}`}
                className="rounded-xl bg-[#051424]/40 border border-[#A88C6F]/10 p-6 space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-5 w-1/2 bg-[#051424]" />
                  <Skeleton className="h-4 w-24 bg-[#051424]" />
                </div>
                <Skeleton className="h-4 w-full bg-[#051424]" />
                <Skeleton className="h-4 w-5/6 bg-[#051424]" />
                <Skeleton className="h-4 w-2/3 bg-[#051424]" />
              </div>
            ))
          ) : reviews.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-3 bg-[#051424]/30 rounded-xl border border-[#A88C6F]/10">
              <MessageSquareQuote className="size-8 text-[#A88C6F]/60 mx-auto" />
              <p className="text-white font-semibold text-lg">No reviews yet</p>
              <p className="text-[#94A3B8]">
                Published customer reviews will appear here.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <article
                key={`review-item-${review.id}`}
                className="flex flex-col justify-between rounded-xl bg-[#051424]/60 border border-[#A88C6F]/20 hover:border-[#A88C6F]/50 transition-all duration-300 shadow-xl p-6 space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-white font-heading font-extrabold text-lg tracking-wide">
                      {review.reviewer_name}
                    </h3>
                    <RatingStars rating={review.rating} />
                  </div>
                  {review.comment ? (
                    <p className="text-[#94A3B8] text-sm leading-relaxed">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  ) : (
                    <p className="text-[#94A3B8]/60 text-sm italic">No comment provided.</p>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
