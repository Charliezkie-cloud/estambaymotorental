"use client";

import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";
import { AdminBookingNotificationPreview } from "@/components/layouts/email-template-previews/admin-booking-notification-preview";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

export default function AdminEmailTemplatePage() {
  return (
    <>
      <AdminSidebar />

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
