import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Types
type Props = {
  supabaseClient: SupabaseClient<Database>
};

export default function AdminDashboardCards({ supabaseClient }: Props) {
  // States
  const [totalActiveVehicles, setTotalActiveVehicles] = useState<number | undefined>(undefined);
  const [vehicleRentedMonth, setVehicleRentedMonth] = useState<number | undefined>(undefined);
  const [occupancyRate, setOccupancyRate] = useState<number | undefined>(undefined);
  const [overallIncome, setOverallIncome] = useState<number | undefined>(undefined);

  // Use effects
  useEffect(() => {
    async function fetchTotalActiveVehicles() {
      const { count, error } = await supabaseClient
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", 1);

      if (error) return toast.error("Failed to Fetch Total Active Vehicles", { description: error.message });

      setTotalActiveVehicles(count ?? 0);
    }

    async function fetchVehicleRentedThisMonth() {
      const { data, error } = await supabaseClient
        .from("rented_vehicles_this_month")
        .select("*")
        .single();

      if (error) return toast.error("Failed to Fetch Vehicle Rented This Month", { description: error.message });

      setVehicleRentedMonth(data.total_rented_vehicles ?? 0);
    }

    async function fetchOverallIncome() {
      const { data, error } = await supabaseClient
        .from("bookings")
        .select("amount");

      if (error) return toast.error("Failed to Fetch Overall Income", { description: error.message });

      const summedData: number = data.reduce((acc, item) => acc + item.amount, 0);
      setOverallIncome(summedData);
    }

    fetchTotalActiveVehicles();
    fetchVehicleRentedThisMonth();
    fetchOverallIncome();
  }, []);

  useEffect(() => {
    function calculateOccupancyRate() {
      if (!vehicleRentedMonth || !totalActiveVehicles) return;
      if (totalActiveVehicles < 1)
        return setOccupancyRate(0);

      setOccupancyRate(vehicleRentedMonth / totalActiveVehicles);
    }

    calculateOccupancyRate();
  }, [totalActiveVehicles, vehicleRentedMonth]);

  return (
    <div className="grid grid-cols-5 gap-6">
      <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2">
        <h3 className="font-heading text-lg md:text-xl font-bold">{new Date().getFullYear()}</h3>
        <p className="md:text-lg">{new Date().toLocaleDateString("en-PH", { month: "long" })}</p>
      </div>

      <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2">
        <h3 className="font-heading text-lg md:text-xl font-bold">Total Active Vehicles</h3>
        {totalActiveVehicles ? (
          <p className="md:text-lg">{totalActiveVehicles}</p>
        ) : (
          <Skeleton className="h-6 w-[100px]" />
        )}
      </div>

      <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2">
        <h3 className="font-heading text-lg md:text-xl font-bold">Vehicle Rented this Month</h3>
        {vehicleRentedMonth ? (
          <p className="md:text-lg">{vehicleRentedMonth}</p>
        ) : (
          <Skeleton className="h-6 w-[100px]" />
        )}
      </div>

      <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2">
        <h3 className="font-heading text-lg md:text-xl font-bold">Occupancy Rate</h3>
        {occupancyRate ? (
          <p className="md:text-lg">{occupancyRate.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 2 })}</p>
        ) : (
          <Skeleton className="h-6 w-[100px]" />
        )}
      </div>

      <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2">
        <h3 className="font-heading text-lg md:text-xl font-bold">Overall Income</h3>
        {overallIncome ? (
          <p className="md:text-lg">{overallIncome.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
        ) : (
          <Skeleton className="h-6 w-[100px]" />
        )}
      </div>
    </div>
  );
}