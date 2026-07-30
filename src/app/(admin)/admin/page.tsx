"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/layouts/admin-sidebar";
import { supabaseClient } from "@/lib/supabase-client";
import { useAuth } from "@/hooks/useAuth";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";
import AdminDashboardCharts from "@/components/layouts/admin-dashboard/admin-dashboard-charts";
import AdminRecentBookingsTable from "@/components/layouts/admin-dashboard/admin-recent-bookings-table";
import Link from "next/link";
import AdminRecentVehiclesTable from "@/components/layouts/admin-dashboard/admin-recent-vehicles-table";

export default function AdminDashboardPage() {
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
          <h2 className="font-heading text-xl md:text-2xl font-bold">Dashboard</h2>

          <AdminDashboardCharts supabaseClient={supabaseClient} />
        </section>

        <section className="space-y-6 m-4 md:m-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold">Recents</h2>

          <div className="grid grid-cols-6 gap-6">
            <div className="md:col-span-4 rounded-xl bg-card border border-border space-y-6">
              <div className="p-4 flex items-center">
                <h2 className="font-heading text-lg md:text-xl font-bold">Recents Bookings</h2>
                <Link href="/admin/bookings" className="ms-auto underline underline-offset-8 text-sm">View All</Link>
              </div>

              <div className="px-4 pb-4">
                <AdminRecentBookingsTable supabaseClient={supabaseClient} />
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl bg-card border border-border space-y-6">
              <div className="p-4 flex items-center">
                <h2 className="font-heading text-lg md:text-xl font-bold">Recently Added Vehicles</h2>
                <Link href="/admin/vehicles" className="ms-auto underline underline-offset-8 text-sm">View All</Link>
              </div>

              <div className="px-4 pb-4">
                <AdminRecentVehiclesTable supabaseClient={supabaseClient} />
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}