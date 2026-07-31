import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getOverallIncome, getRentedVehiclesThisMonth, getTotalActiveVehicles } from "@/lib/supabase/supabase-views";

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

  return (
    <div className="overflow-x-auto flex justify-start items-center gap-6 w-full pb-6">
      <div className="shrink-0 bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2 min-w-[200px]">
        <h3 className="font-heading text-lg md:text-xl font-bold">{new Date().getFullYear()}</h3>
        <p className="md:text-lg">{new Date().toLocaleDateString("en-PH", { month: "long" })}</p>
      </div>

      <div className="shrink-0 bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2 min-w-[200px]">
        <h3 className="font-heading text-lg md:text-xl font-bold">Total Active Vehicles</h3>
        {totalActiveVehicles !== undefined ? (
          <p className="md:text-lg">{totalActiveVehicles}</p>
        ) : (
          <Skeleton className="h-6 w-[100px]" />
        )}
      </div>

      <div className="shrink-0 bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2 min-w-[200px]">
        <h3 className="font-heading text-lg md:text-xl font-bold">Vehicle Rented this Month</h3>
        {vehicleRentedMonth !== undefined ? (
          <p className="md:text-lg">{vehicleRentedMonth}</p>
        ) : (
          <Skeleton className="h-6 w-[100px]" />
        )}
      </div>

      <div className="shrink-0 bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2 min-w-[200px]">
        <h3 className="font-heading text-lg md:text-xl font-bold">Occupancy Rate</h3>
        {occupancyRate !== undefined ? (
          <p className="md:text-lg">{occupancyRate.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 2 })}</p>
        ) : (
          <Skeleton className="h-6 w-[100px]" />
        )}
      </div>

      <div className="shrink-0 bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2 min-w-[200px]">
        <h3 className="font-heading text-lg md:text-xl font-bold">Overall Income</h3>
        {overallIncome !== undefined ? (
          <p className="md:text-lg">{overallIncome.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
        ) : (
          <Skeleton className="h-6 w-[100px]" />
        )}
      </div>
    </div>
  );
}