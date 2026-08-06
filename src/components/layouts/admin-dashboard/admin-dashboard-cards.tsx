"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getOverallIncome, getRentedVehiclesThisMonth, getTotalActiveVehicles } from "@/lib/supabase/supabase-views";
import { Bike, CalendarCheck, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboardCards() {
  // States
  const [totalActiveVehicles, setTotalActiveVehicles] = useState<number | undefined>(undefined);
  const [vehicleRentedMonth, setVehicleRentedMonth] = useState<number | undefined>(undefined);
  const [occupancyRate, setOccupancyRate] = useState<number | undefined>(undefined);
  const [overallIncome, setOverallIncome] = useState<number | undefined>(undefined);

  // Use effects
  useEffect(() => {
    async function fetchTotalActiveVehicles() {
      try {
        const data = await getTotalActiveVehicles();
        setTotalActiveVehicles(data ?? 0);
      } catch (error) {
        toast.error("Failed to Fetch Total Active Vehicles", {
          description: error instanceof Error ? error.message : String(error)
        });
      }
    }

    async function fetchVehicleRentedThisMonth() {
      try {
        const data = await getRentedVehiclesThisMonth();
        setVehicleRentedMonth(data ?? 0);
      } catch (error) {
        toast.error("Failed to Fetch Vehicles Rented this Month", {
          description: error instanceof Error ? error.message : String(error)
        });
      }
    }

    async function fetchOverallIncome() {
      try {
        const data = await getOverallIncome();
        setOverallIncome(data ?? 0);
      } catch (error) {
        toast.error("Failed to Fetch Overall Income", {
          description: error instanceof Error ? error.message : String(error)
        });
      }
    }

    fetchTotalActiveVehicles();
    fetchVehicleRentedThisMonth();
    fetchOverallIncome();
  }, []);

  useEffect(() => {
    function calculateOccupancyRate() {
      if (!vehicleRentedMonth || !totalActiveVehicles) return setOccupancyRate(0);
      if (totalActiveVehicles < 1) return setOccupancyRate(0);

      setOccupancyRate(vehicleRentedMonth / totalActiveVehicles);
    }

    calculateOccupancyRate();
  }, [totalActiveVehicles, vehicleRentedMonth]);

  const currentMonthName = new Date().toLocaleDateString("en-PH", { month: "long" });
  const currentYear = new Date().getFullYear();

  const occupancyPercent = occupancyRate !== undefined ? Math.min(Math.round(occupancyRate * 100), 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
      {/* Total Active Vehicles */}
      <Card className="relative overflow-hidden border border-border/60 bg-card hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Vehicles
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
              <Bike className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {totalActiveVehicles !== undefined ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading tracking-tight">{totalActiveVehicles}</span>
                <span className="text-xs text-primary font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Operational
                </span>
              </div>
            ) : (
              <Skeleton className="h-8 w-24 rounded-md" />
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Ready for customer booking</p>
        </CardContent>
      </Card>

      {/* Rented This Month */}
      <Card className="relative overflow-hidden border border-border/60 bg-card hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rented This Month
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {vehicleRentedMonth !== undefined ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading tracking-tight">{vehicleRentedMonth}</span>
                <span className="text-xs text-muted-foreground font-medium">{currentMonthName}</span>
              </div>
            ) : (
              <Skeleton className="h-8 w-24 rounded-md" />
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Total rentals in {currentMonthName} {currentYear}</p>
        </CardContent>
      </Card>

      {/* Occupancy Rate */}
      <Card className="relative overflow-hidden border border-border/60 bg-card hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Occupancy Rate
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {occupancyRate !== undefined ? (
              <div>
                <span className="text-3xl font-bold font-heading tracking-tight">
                  {occupancyRate.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 1 })}
                </span>
                <div className="w-full bg-secondary h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <Skeleton className="h-8 w-24 rounded-md" />
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Fleet utilization efficiency</p>
        </CardContent>
      </Card>

      {/* Overall Income */}
      <Card className="relative overflow-hidden border border-border/60 bg-card hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overall Income
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {overallIncome !== undefined ? (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold font-heading tracking-tight">
                  {overallIncome.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                </span>
              </div>
            ) : (
              <Skeleton className="h-8 w-32 rounded-md" />
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Total paid booking revenue</p>
        </CardContent>
      </Card>
    </div>
  );
}