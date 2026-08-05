import { MonthlyBookingsCountsViewItem, VehicleIncomesViewItem } from "@/types/models.types";
import { supabaseClient } from "@/lib/supabase/supabase-client";

// Functions
export async function getMonthlyBookingCounts(): Promise<MonthlyBookingsCountsViewItem[] | null> {
  const { data, error } = await supabaseClient
    .from("monthly_bookings_counts")
    .select("*")

  if (error) throw error;
  if (!data) return null;

  return data;
}

export async function getVehiclesIncomes(): Promise<VehicleIncomesViewItem[] | null> {
  const { data, error } = await supabaseClient
    .from("vehicles_income")
    .select("*");

  if (error) throw error;
  if (!data) return null;

  return data;
}

export async function getRentedVehiclesThisMonth(): Promise<number | null> {
  const { data, error } = await supabaseClient
    .from("rented_vehicles_this_month")
    .select("*")
    .single();

  if (error) throw error;
  if (!data || !data?.total_rented_vehicles) return null;

  return data.total_rented_vehicles;
}

// Non views functions
export async function getTotalActiveVehicles(): Promise<number | null> {
  const { count, error } = await supabaseClient
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("status", 1);

  if (error) throw error;
  if (!count) return null;

  return count;
}

export async function getOverallIncome(): Promise<number | null> {
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("amount")
    .eq("payment_status", 1)

  if (error) throw error;
  if (!data) return null;

  return data.reduce((prev, item) => prev + item.amount, 0);
}