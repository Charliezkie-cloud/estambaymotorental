import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MonthlyBookingsCountsViewItem, VehicleIncomesViewItem } from "@/types/models.types";
import { getMonthlyBookingCounts, getVehiclesIncomes } from "@/lib/supabase/supabase-views";

// Configs
const incomeChartConfig = {
  model: { label: "Model", color: "#fb7185" },
} satisfies ChartConfig;

const monthlyBookingChartConfig = {
  total_bookings: { label: "Bookings", color: "#60a5fa" }
} satisfies ChartConfig;

export default function AdminDashboardCharts() {
  // States
  const [vehiclesIncomeData, setVehiclesIncomeData] = useState<VehicleIncomesViewItem[]>([]);
  const [monthlyBookingData, setMonthlyBookingData] = useState<MonthlyBookingsCountsViewItem[]>([]);

  // Use effects
  useEffect(() => {
    if (vehiclesIncomeData.length > 0) return;

    async function fetchVehicleIncomes() {
      try {
        const data = await getVehiclesIncomes();
        setVehiclesIncomeData(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Vehicles Income", {
          description: error instanceof Error ? error.message : String(error)
        });
      }
    }

    fetchVehicleIncomes();
  }, []);

  useEffect(() => {
    if (monthlyBookingData.length > 0) return;

    async function fetchMonthlyBookings() {
      try {
        const data = await getMonthlyBookingCounts();
        setMonthlyBookingData(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Monthly Bookings Data", {
          description: error instanceof Error ? error.message : String(error)
        });
      }
    }

    fetchMonthlyBookings();
  }, []);

  return (
    <div>
      <div className="grid grid-rows-2 grid-cols-none md:grid-rows-none md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-4 rounded-xl space-y-6">
          <h2 className="font-heading text-center text-lg md:text-xl font-bold">Income Per Vehicle</h2>

          <ChartContainer config={incomeChartConfig} className="w-full">
            <BarChart data={vehiclesIncomeData} accessibilityLayer>
              <Bar dataKey="total" radius={4} fill="var(--color-model)">
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={value => Number.parseInt(value as string).toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                  />
              </Bar>
              <CartesianGrid vertical={false} />
              <ChartTooltip content={<ChartTooltipContent/>} />
              <XAxis
                dataKey="model"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl space-y-6">
          <h2 className="font-heading text-center text-lg md:text-xl font-bold">Monthly Bookings</h2>
          <ChartContainer config={monthlyBookingChartConfig} className="w-full">
            <BarChart data={monthlyBookingData} accessibilityLayer>
              <Bar dataKey="total_bookings" radius={4} fill="var(--color-total_bookings)">
                <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
              </Bar>
              <CartesianGrid vertical={false} />
              <ChartTooltip content={<ChartTooltipContent/>} />
              <XAxis
                dataKey="booking_month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "long" })}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}