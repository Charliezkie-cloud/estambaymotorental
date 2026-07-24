"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/layouts/admin-sidebar";
import { supabaseClient } from "@/lib/supabase-client";
import { useAuth } from "@/hooks/useAuth";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";

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
          <h1 className="font-heading text-xl md:text-2xl font-bold">Dashboard</h1>
        </section>

      </main>
    </>
  );
}