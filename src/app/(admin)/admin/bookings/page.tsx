"use client";

import AdminSidebar from "@/components/layouts/admin-sidebar";
import { supabaseClient } from "@/lib/supabase-client";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";
import AdminBookingsTable from "@/components/layouts/bookings-table/admin-bookings-table";

export default function AdminBookingsPage() {
  return (
    <>
      <AdminSidebar supabaseClient={supabaseClient} />

      <main className="w-full">
        <AdminResponsiveSidebarTrigger />

        <section className="space-y-6 m-4 md:m-6">
          <h1 className="font-heading text-xl md:text-2xl font-bold">Bookings</h1>
          <AdminBookingsTable />
        </section>

      </main>
    </>
  );
}