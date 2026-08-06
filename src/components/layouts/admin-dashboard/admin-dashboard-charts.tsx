"use client";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MonthlyBookingsCountsViewItem, VehicleIncomesViewItem } from "@/types/models.types";
import { getMonthlyBookingCounts, getVehiclesIncomes } from "@/lib/supabase/supabase-views";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Configs
const incomeChartConfig = {
  total: { label: "Revenue", color: "var(--primary)" },
} satisfies ChartConfig;

const monthlyBookingChartConfig = {
  total_bookings: { label: "Bookings", color: "var(--primary)" }
} satisfies ChartConfig;

export default function AdminDashboardCharts() {
  // States
  const [vehiclesIncomeData, setVehiclesIncomeData] = useState<VehicleIncomesViewItem[]>([]);
  const [monthlyBookingData, setMonthlyBookingData] = useState<MonthlyBookingsCountsViewItem[]>([]);
  const [loadingIncome, setLoadingIncome] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Use effects
  useEffect(() => {
    async function fetchVehicleIncomes() {
      try {
        const data = await getVehiclesIncomes();
        setVehiclesIncomeData(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Vehicles Income", {
          description: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setLoadingIncome(false);
      }
    }

    fetchVehicleIncomes();
  }, []);

  useEffect(() => {
    async function fetchMonthlyBookings() {
      try {
        const data = await getMonthlyBookingCounts();
        setMonthlyBookingData(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Monthly Bookings Data", {
          description: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setLoadingBookings(false);
      }
    }

    fetchMonthlyBookings();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Income Per Vehicle Chart */}
      <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-bold font-heading flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Income Per Vehicle
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Revenue distribution across fleet models
            </CardDescription>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="w-4 h-4" />
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-4">
          {loadingIncome ? (
            <div className="h-[280px] w-full flex items-end gap-3 justify-between pt-8 pb-4">
              <Skeleton className="h-2/3 w-full rounded-t-md" />
              <Skeleton className="h-4/5 w-full rounded-t-md" />
              <Skeleton className="h-1/2 w-full rounded-t-md" />
              <Skeleton className="h-full w-full rounded-t-md" />
              <Skeleton className="h-3/4 w-full rounded-t-md" />
            </div>
          ) : vehiclesIncomeData.length === 0 ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
              <BarChart3 className="w-8 h-8 opacity-40" />
              <span>No vehicle income data recorded yet</span>
            </div>
          ) : (
            <ChartContainer config={incomeChartConfig} className="h-[280px] w-full">
              <BarChart data={vehiclesIncomeData} accessibilityLayer margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="url(#incomeGradient)">
                  <LabelList
                    position="top"
                    offset={10}
                    className="fill-foreground font-semibold"
                    fontSize={11}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => 
                      Number(value ?? 0).toLocaleString("en-PH", { 
                        style: "currency", 
                        currency: "PHP",
                        maximumFractionDigits: 0 
                      })
                    }
                  />
                </Bar>
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <XAxis
                  dataKey="model"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="text-xs font-medium"
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Monthly Bookings Chart */}
      <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-bold font-heading flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Monthly Bookings
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Total customer bookings breakdown by month
            </CardDescription>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="w-4 h-4" />
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-4">
          {loadingBookings ? (
            <div className="h-[280px] w-full flex items-end gap-3 justify-between pt-8 pb-4">
              <Skeleton className="h-1/2 w-full rounded-t-md" />
              <Skeleton className="h-3/4 w-full rounded-t-md" />
              <Skeleton className="h-full w-full rounded-t-md" />
              <Skeleton className="h-4/5 w-full rounded-t-md" />
            </div>
          ) : monthlyBookingData.length === 0 ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
              <BarChart3 className="w-8 h-8 opacity-40" />
              <span>No monthly bookings recorded yet</span>
            </div>
          ) : (
            <ChartContainer config={monthlyBookingChartConfig} className="h-[280px] w-full">
              <BarChart data={monthlyBookingData} accessibilityLayer margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <Bar dataKey="total_bookings" radius={[6, 6, 0, 0]} fill="url(#bookingsGradient)">
                  <LabelList position="top" offset={10} className="fill-foreground font-semibold" fontSize={11} />
                </Bar>
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <XAxis
                  dataKey="booking_month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="text-xs font-medium"
                  tickFormatter={(value) => {
                    try {
                      return new Date(value).toLocaleDateString("en-US", { month: "short" });
                    } catch {
                      return String(value);
                    }
                  }}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}