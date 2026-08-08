"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/layouts/admin-sidebar";
import { supabaseClient } from "@/lib/supabase/supabase-client";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";
import { AdminBookingNotificationPreview } from "@/components/layouts/email-template-previews/admin-booking-notification-preview";
import { useAuth } from "@/hooks/useAuth";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

export default function AdminEmailTemplatePage() {
  // Hooks
  const { loading, user, error } = useAuth();

  // Use effects
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
          <h2 className="font-heading text-xl md:text-2xl font-bold">
            Email Templates
          </h2>
          <Bubble variant="tinted">
            <BubbleContent>
              This page previews the admin booking notification email. Sample
              customer and booking values are used in place of live template
              placeholders.
            </BubbleContent>
          </Bubble>
          <AdminBookingNotificationPreview />
        </section>
      </main>
    </>
  );
}
