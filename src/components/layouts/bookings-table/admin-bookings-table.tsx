import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdminAddBookingDialog from "@/components/layouts/bookings-table/admin-add-booking-dialog";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { BookingRow, VehicleRow } from "@/types/models.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminEditBookingDialog from "@/components/layouts/bookings-table/admin-edit-booking-dialog";
import AdminDetailsBookingDialog from "@/components/layouts/bookings-table/admin-details-booking-dialog";

type Props = {
  supabaseClient: SupabaseClient<Database>;
};

export default function AdminBookingsTable({ supabaseClient }: Props) {
  // States
  const [vehiclesRow, setVehiclesRow] = useState<VehicleRow[]>([]);
  const [bookingsRow, setBookingsRow] = useState<BookingRow[]>([]);
  const [updateBookingRow, setUpdateBookingRow] = useState<BookingRow | undefined>(undefined);
  const [detailsBookingRow, setDetailsBookingRow] = useState<BookingRow | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onRowAdd(row: BookingRow) {
    const [receiptImageUrl, driversLicenseImageUrl, validIdImageUrl] = await Promise.all([
      getSignedUrl("receipts", row.payment_receipt_image),
      getSignedUrl("drivers_license", row.drivers_license_image),
      getSignedUrl("ids", row.valid_id_image)
    ]);

    setBookingsRow(prev => [
      ...prev,
      {
        ...row,
        receipt_image_url: typeof receiptImageUrl === "string" ? receiptImageUrl : "",
        drivers_license_image_url: typeof driversLicenseImageUrl === "string" ? driversLicenseImageUrl : "",
        valid_id_image_url: typeof validIdImageUrl === "string" ? validIdImageUrl : ""
      }
    ]);
  }

  async function onRowUpdate(row: BookingRow) {
    setUpdateBookingRow(undefined);

    const [receiptImageUrl, driversLicenseImageUrl, validIdImageUrl] = await Promise.all([
      getSignedUrl("receipts", row.payment_receipt_image),
      getSignedUrl("drivers_license", row.drivers_license_image),
      getSignedUrl("ids", row.valid_id_image)
    ]);

    setBookingsRow(prev => prev.map(e => e.id === row.id ? {
      ...row,
      receipt_image_url: typeof receiptImageUrl === "string" ? receiptImageUrl : "",
      drivers_license_image_url: typeof driversLicenseImageUrl === "string" ? driversLicenseImageUrl : "",
      valid_id_image_url: typeof validIdImageUrl === "string" ? validIdImageUrl : ""
    } : e));
  }

  // Helpers
  async function getSignedUrl(bucket: string, filepath: string) {
    const { data, error } = await supabaseClient
      .storage
      .from(bucket)
      .createSignedUrl(filepath, 3600);

    if (error)
      return toast.error("Failed to Fetch the Image",{ description: error.message });

    return data.signedUrl;
  }

  // Use effects
  useEffect(() => {
    if (vehiclesRow.length > 0)
      return;

    async function fetchVehicles() {
      const { data, error } = await supabaseClient
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error)
        return toast.error("Failed to Fetch Vehicles", { description: error.message });

      setVehiclesRow(data);
    }

    fetchVehicles();
  }, []);

  useEffect(() => {
    if (bookingsRow.length > 0)
      return;

    async function fetchBookings() {
      setLoading(true);

      try {
        const { data, error } = await supabaseClient
          .from("bookings")
          .select("*, vehicles(model, vehicle_colors(name))")
          .order("created_at", { ascending: false });

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
    <div className="space-y-3 bg-card border border-border p-4 rounded-xl">
      <AdminEditBookingDialog supabaseClient={supabaseClient}
                              vehiclesRow={vehiclesRow}
                              row={updateBookingRow}
                              onRowUpdate={onRowUpdate}
                              onCancel={() => setUpdateBookingRow(undefined)} />
      <AdminDetailsBookingDialog row={detailsBookingRow}
                                 onClose={() => setDetailsBookingRow(undefined)} />

      <div className="flex">
        <AdminAddBookingDialog supabaseClient={supabaseClient}
                               vehiclesRow={vehiclesRow}
                               onRowAdd={onRowAdd} />
      </div>

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
            <TableHead className="text-end">Actions</TableHead>
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
                <TableCell className="text-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost"><MoreHorizontalIcon/></Button>} />
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Row Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setDetailsBookingRow(item)}>Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setUpdateBookingRow(item)}>Edit</DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

    </div>
  );
}