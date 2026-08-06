"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingRow } from "@/types/models.types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getAllBookings } from "@/lib/supabase/tables/bookings-table";
import { User, Bike, Calendar, ReceiptText } from "lucide-react";

export default function AdminRecentBookingsTable() {
  // States
  const [loading, setLoading] = useState(true);
  const [bookingsRow, setBookingsRow] = useState<BookingRow[]>([]);

  // Use effects
  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);

      try {
        const data = await getAllBookings(10);
        setBookingsRow(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Recent Bookings", {
          description: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const renderPaymentStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="default">Paid</Badge>;
      case 2:
        return <Badge variant="secondary">Partially Paid</Badge>;
      case 3:
      default:
        return <Badge variant="outline" className="text-muted-foreground border-border">Pending</Badge>;
    }
  };

  const renderBookingStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="default">Completed</Badge>;
      case 2:
        return <Badge variant="secondary">Change Unit</Badge>;
      case 3:
        return <Badge variant="outline">Reserved</Badge>;
      case 4:
        return <Badge variant="outline">Rescheduled</Badge>;
      case 5:
        return <Badge variant="destructive">Cancelled</Badge>;
      case 6:
        return <Badge variant="secondary">On Going</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs uppercase tracking-wider">
            <TableHead className="font-semibold py-3">Rental ID</TableHead>
            <TableHead className="font-semibold py-3">Customer</TableHead>
            <TableHead className="font-semibold py-3">Vehicle</TableHead>
            <TableHead className="font-semibold py-3">Booked At</TableHead>
            <TableHead className="font-semibold py-3 text-right">Amount</TableHead>
            <TableHead className="font-semibold py-3 text-center">Payment</TableHead>
            <TableHead className="font-semibold py-3 text-center">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && [1, 2, 3, 4, 5].map((item) => (
            <TableRow key={`bookings-table-skeleton-${item}`}>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 ms-auto" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
            </TableRow>
          ))}

          {!loading && bookingsRow.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <ReceiptText className="w-6 h-6 opacity-40" />
                  <p className="text-sm">No recent bookings found.</p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!loading && bookingsRow.map((item) => {
            const formattedCreatedAt = new Date(item.created_at).toLocaleDateString("en-PH", {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <TableRow key={`bookings-table-item-${item.id}`} className="hover:bg-muted/30 transition-colors text-xs md:text-sm">
                <TableCell className="font-mono font-medium text-xs text-muted-foreground">
                  #{item.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-foreground truncate max-w-[140px]" title={item.full_name}>
                      {item.full_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium">{item.vehicles?.model ?? "N/A"}</span>
                    {item.vehicles?.vehicle_colors?.name && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                        {item.vehicles.vehicle_colors.name}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 opacity-60" />
                    {formattedCreatedAt}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {item.amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                </TableCell>
                <TableCell className="text-center">
                  {renderPaymentStatusBadge(item.payment_status)}
                </TableCell>
                <TableCell className="text-center">
                  {renderBookingStatusBadge(item.booking_status)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}