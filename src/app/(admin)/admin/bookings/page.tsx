"use client";

import AdminSidebar from "@/components/layouts/admin-sidebar";
import { supabaseClient } from "@/lib/supabase/supabase-client";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";
import AdminBookingsTable from "@/components/layouts/bookings-table/admin-bookings-table";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

export default function AdminBookingsPage() {
  // Hooks
  const { loading, user, error } = useAuth();

  // Use effects
  useEffect(() => {
    if (error)
      toast.error("Session Failed", {
        description: error
      });

    if (!loading && !user)
      return redirect("/admin/login");
  }, [loading, user, error]);

  return (
    <>
      <AdminSidebar supabaseClient={supabaseClient} />

      <main className="w-full">
        <AdminResponsiveSidebarTrigger />

        <section className="space-y-6 m-4 md:m-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold">Bookings</h2>
          <AdminBookingsTable supabaseClient={supabaseClient} />
        </section>

      </main>
    </>
  );
}