"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  BarChart3, 
  ReceiptText, 
  Bike, 
  ArrowUpRight, 
  Plus, 
  Calendar,
  Sparkles,
  RefreshCw
} from "lucide-react";

import AdminSidebar from "@/components/layouts/admin-sidebar";
import { supabaseClient } from "@/lib/supabase/supabase-client";
import { useAuth } from "@/hooks/useAuth";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";
import AdminDashboardCharts from "@/components/layouts/admin-dashboard/admin-dashboard-charts";
import AdminRecentBookingsTable from "@/components/layouts/admin-dashboard/admin-recent-bookings-table";
import AdminRecentVehiclesTable from "@/components/layouts/admin-dashboard/admin-recent-vehicles-table";
import AdminDashboardCards from "@/components/layouts/admin-dashboard/admin-dashboard-cards";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  // Hooks
  const { loading, user, error } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Use effects
  useEffect(() => {
    if (error)
      toast.error("Session Failed", {
        description: error
      });

    if (!loading && !user)
      return redirect("/admin/login");
  }, [loading, user, error]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Dashboard refreshed");
  };

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <>
      <AdminSidebar supabaseClient={supabaseClient} />

      <main className="w-full min-h-screen bg-background pb-12">
        <AdminResponsiveSidebarTrigger />

        {/* Hero Header */}
        <div className="mx-4 md:mx-6 mt-2 mb-6">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-card via-card/90 to-primary/5 p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fleet Management Portal</span>
                </div>
                <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
                  Welcome back, Admin 👋
                </h1>
                <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentDateFormatted}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="gap-2 shadow-xs hover:bg-accent"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <Link 
                  href="/admin/vehicles" 
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2 shadow-xs")}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards Section */}
        <section className="space-y-4 mx-4 md:mx-6 mb-8" key={`dashboard-cards-${refreshKey}`}>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg md:text-xl font-bold">Metrics Overview</h2>
          </div>
          <AdminDashboardCards />
        </section>

        {/* Charts & Analytics Section */}
        <section className="space-y-4 mx-4 md:mx-6 mb-8" key={`dashboard-charts-${refreshKey}`}>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg md:text-xl font-bold">Analytics & Revenue</h2>
          </div>
          <AdminDashboardCharts />
        </section>

        {/* Recent Activity Grid Section */}
        <section className="space-y-4 mx-4 md:mx-6" key={`dashboard-recents-${refreshKey}`}>
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg md:text-xl font-bold">Recent Fleet Activity</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            {/* Recent Bookings */}
            <Card className="lg:col-span-4 border border-border/60 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <ReceiptText className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold font-heading">Recent Bookings</CardTitle>
                    <p className="text-xs text-muted-foreground">Latest customer rental requests</p>
                  </div>
                </div>
                <Link 
                  href="/admin/bookings" 
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs font-semibold hover:text-primary")}
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5 ms-0.5" />
                </Link>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <AdminRecentBookingsTable />
              </CardContent>
            </Card>

            {/* Recently Added Vehicles */}
            <Card className="lg:col-span-2 border border-border/60 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold font-heading">Fleet Additions</CardTitle>
                    <p className="text-xs text-muted-foreground">Recently registered vehicles</p>
                  </div>
                </div>
                <Link 
                  href="/admin/vehicles" 
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs font-semibold hover:text-primary")}
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5 ms-0.5" />
                </Link>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <AdminRecentVehiclesTable />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}