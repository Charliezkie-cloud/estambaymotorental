import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingRow } from "@/types/models.types";
import { SELECT_BOOKING_QUERY } from "@/lib/helpers/table-helpers";
import { toast } from "sonner";
import { getSignedUrl } from "@/lib/supabase/supabase-storage";
import { Badge } from "@/components/ui/badge";

type Props = {
  supabaseClient: SupabaseClient<Database>;
};

export default function AdminRecentBookingsTable({ supabaseClient }: Props) {
  // States
  const [loading, setLoading] = useState(false);
  const [bookingsRow, setBookingsRow] = useState<BookingRow[]>([]);

  // Use effects
  useEffect(() => {
    if (bookingsRow.length > 0)
      return;

    async function fetchBookings() {
      setLoading(true);

      try {
        const { data, error } = await supabaseClient
          .from("bookings")
          .select(SELECT_BOOKING_QUERY)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error)
          return toast.error("Failed to Fetch Bookings", { description: error.message });

        const updatedBookings: BookingRow[] = await Promise.all(
          data.map(async (e) => {
            const [receiptImageUrl, driversLicenseImageUrl, validIdImageUrl] = await Promise.all([
              getSignedUrl("receipts", e.payment_receipt_image),
              getSignedUrl("drivers_license", e.drivers_license_image),
              getSignedUrl("ids", e.valid_id_image)
            ]);

            return {
              ...e,
              receipt_image_url: typeof receiptImageUrl === "string" ? receiptImageUrl : "",
              drivers_license_image_url: typeof driversLicenseImageUrl === "string" ? driversLicenseImageUrl : "",
              valid_id_image_url: typeof validIdImageUrl === "string" ? validIdImageUrl : ""
            };
          })
        );

        setBookingsRow(updatedBookings);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);


  return (
    <Table className="max-h-[750px]">
      <TableCaption>A list of your Bookings</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Rental ID</TableHead>
          <TableHead>Booked At</TableHead>
          <TableHead>Full Name</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Booking Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading && [1, 2, 3, 4, 5].map(item => (
          <TableRow key={`bookings-table-skeleton-${item}`}>
            <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
            <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
            <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
            <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
          </TableRow>
        ))}

        {!loading && bookingsRow.map(item => {
          const formattedCreatedAt = new Date(item.created_at).toLocaleDateString("en-PH", {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          });

          return (
            <TableRow key={`bookings-table-item-${item.id}`}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{formattedCreatedAt}</TableCell>
              <TableCell>{item.full_name}</TableCell>
              <TableCell>{item.vehicles?.model}</TableCell>
              <TableCell>{item.amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</TableCell>
              <TableCell>
                {item.payment_status === 1 && (<Badge>Paid</Badge>)}
                {item.payment_status === 2 && (<Badge variant="secondary">Partially Paid</Badge>)}
                {item.payment_status === 3 && (<Badge variant="outline">Pending</Badge>)}
              </TableCell>
              <TableCell>
                {item.booking_status === 1 && (<Badge>Completed</Badge>)}
                {item.booking_status === 2 && (<Badge variant="outline">Change Unit</Badge>)}
                {item.booking_status === 3 && (<Badge variant="secondary">Reserved</Badge>)}
                {item.booking_status === 4 && (<Badge variant="outline">Rescheduled</Badge>)}
                {item.booking_status === 5 && (<Badge variant="destructive">Cancelled</Badge>)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>

    </Table>
  );
}