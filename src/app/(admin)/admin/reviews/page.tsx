"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/layouts/admin-sidebar";
import { supabaseClient } from "@/lib/supabase/supabase-client";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import AdminReviewsTable from "@/components/layouts/reviews-table/admin-reviews-table";

export default function AdminReviewsPage() {
  const { loading, user, error } = useAuth();

  useEffect(() => {
    if (error)
      toast.error("Session Failed", {
        description: error,
      });

    if (!loading && !user) return redirect("/admin/login");
  }, [loading, user, error]);

  return (
    <>
      <AdminSidebar supabaseClient={supabaseClient} />

      <main className="w-full">
        <AdminResponsiveSidebarTrigger />

        <section className="space-y-6 m-4 md:m-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold">Reviews</h2>
          <Bubble variant="tinted">
            <BubbleContent>
              Manage customer reviews and control which ones appear on the public website.
              Use the published toggle to show or hide a review without deleting it.
            </BubbleContent>
          </Bubble>
          <AdminReviewsTable />
        </section>
      </main>
    </>
  );
}
