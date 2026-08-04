import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdminAddBookingDialog from "@/components/layouts/bookings-table/admin-add-booking-dialog";
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
import AdminDeleteBookingDialog from "@/components/layouts/bookings-table/admin-delete-booking-dialog";

import { getAllBookings, updateBookingStatus } from "@/lib/supabase/tables/bookings-table";
import { getAllVehicles } from "@/lib/supabase/tables/vehicles-tables";

export default function AdminBookingsTable() {
  // States
  const [vehiclesRow, setVehiclesRow] = useState<VehicleRow[]>([]);
  const [bookingsRow, setBookingsRow] = useState<BookingRow[]>([]);
  const [updateBookingRow, setUpdateBookingRow] = useState<BookingRow | undefined>(undefined);
  const [detailsBookingRow, setDetailsBookingRow] = useState<BookingRow | undefined>(undefined);
  const [deleteBookingRow, setDeleteBookingRow] = useState<BookingRow | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onRowAdd(row: BookingRow | null) {
    if (!row) return null;
    setBookingsRow(prev => [...prev, row]);
  }

  async function onRowUpdate(row: BookingRow | null) {
    setUpdateBookingRow(undefined);
    if (!row) return;
    setBookingsRow(prev => prev.map(e => e.id === row.id ? row : e));
  }

  async function onRowDelete(row: BookingRow | null) {
    setDeleteBookingRow(undefined);
    if (!row) return;
    setBookingsRow(prev => prev.filter(e => e.id !== row.id));
  }

  async function onRowBookingStatusUpdate(status: number, id: number, isPayment: boolean = false) {
    try {
      const data = await updateBookingStatus(id, status, isPayment);
      if (!data) return;
      setBookingsRow(prev => prev.map(e => e.id === data.id ? data : e));
    } catch (error) {
      toast.error("Failed to Update Booking Status", {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Use effects
  useEffect(() => {
    if (vehiclesRow.length > 0) return;

    async function fetchVehicles() {
      const data = await getAllVehicles();
      setVehiclesRow(data ?? []);
    }

    fetchVehicles();
  }, []);

  useEffect(() => {
    if (bookingsRow.length > 0) return;

    async function fetchBookings() {
      setLoading(true);

      try {
        const data = await getAllBookings();
        setBookingsRow(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Bookings", {
          description: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  return (
    <div className="space-y-3 bg-card border border-border p-4 rounded-xl">
      <AdminEditBookingDialog
        bookingsRow={bookingsRow}
        vehiclesRow={vehiclesRow}
        row={updateBookingRow}
        onRowUpdate={onRowUpdate}
        onCancel={() => setUpdateBookingRow(undefined)}
      />
      <AdminDetailsBookingDialog
        row={detailsBookingRow}
        onClose={() => setDetailsBookingRow(undefined)}
      />
      <AdminDeleteBookingDialog
        row={deleteBookingRow}
        onCancel={() => setDeleteBookingRow(undefined)}
        onDelete={onRowDelete}
      />

      <div className="flex">
        <AdminAddBookingDialog
          bookingsRow={bookingsRow}
          vehiclesRow={vehiclesRow}
          onRowAdd={onRowAdd}
        />
      </div>

      <Table className="max-h-[750px]">
        <TableCaption>A list of your Bookings</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Rental ID</TableHead>
            <TableHead>Booked At</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Color</TableHead>
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
                <TableCell>{item.vehicles?.vehicle_colors?.name}</TableCell>
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
                        <DropdownMenuLabel>Booking Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(1, item.id)}>Completed</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(2, item.id)}>Change Unit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(3, item.id)}>Reserved</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(4, item.id)}>Rescheduled</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(5, item.id)}>Cancelled</DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(1, item.id, true)}>Paid</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(2, item.id, true)}>Partially Paid</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(3, item.id, true)}>Pending</DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteBookingRow(item)}>Delete</DropdownMenuItem>
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