import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdminAddBookingDialog from "@/components/layouts/bookings-table/admin-add-booking-dialog";
import { BookingRow, PaymentMethodRow, VehicleRow } from "@/types/models.types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ArrowDown, ArrowUp, ArrowUpDown, BookOpen, MoreHorizontalIcon, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminEditBookingDialog from "@/components/layouts/bookings-table/admin-edit-booking-dialog";
import AdminDetailsBookingDialog from "@/components/layouts/bookings-table/admin-details-booking-dialog";
import AdminDeleteBookingDialog from "@/components/layouts/bookings-table/admin-delete-booking-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getAllBookings, updateBookingStatus } from "@/lib/supabase/tables/bookings-table";
import { getAllVehicles } from "@/lib/supabase/tables/vehicles-tables";
import { getAllPaymentMethods } from "@/lib/supabase/tables/payment-methods-table";

type BookingStatusFilter = "all" | "completed" | "change_unit" | "reserved" | "rescheduled" | "cancelled" | "ongoing";
type PaymentStatusFilter = "all" | "paid" | "partially_paid" | "pending";
type SortField = "id" | "full_name" | "amount" | "rental_date" | "created_at";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface FilterOption {
  value: string;
  label: string;
}

const BOOKING_STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Booking Statuses" },
  { value: "completed", label: "Completed" },
  { value: "change_unit", label: "Change Unit" },
  { value: "reserved", label: "Reserved" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "cancelled", label: "Cancelled" },
  { value: "ongoing", label: "On-Going" },
];

const PAYMENT_STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Payment Statuses" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "pending", label: "Pending" },
];

const BOOKING_STATUS_MAP: Record<BookingStatusFilter, number | null> = {
  all: null,
  completed: 1,
  change_unit: 2,
  reserved: 3,
  rescheduled: 4,
  cancelled: 5,
  ongoing: 6,
};

const PAYMENT_STATUS_MAP: Record<PaymentStatusFilter, number | null> = {
  all: null,
  paid: 1,
  partially_paid: 2,
  pending: 3,
};

export default function AdminBookingsTable() {
  // States
  const [vehiclesRow, setVehiclesRow] = useState<VehicleRow[]>([]);
  const [bookingsRow, setBookingsRow] = useState<BookingRow[]>([]);
  const [paymentMethodRows, setPaymentMethodRows] = useState<PaymentMethodRow[]>([]);
  const [updateBookingRow, setUpdateBookingRow] = useState<BookingRow | undefined>(undefined);
  const [detailsBookingRow, setDetailsBookingRow] = useState<BookingRow | undefined>(undefined);
  const [deleteBookingRow, setDeleteBookingRow] = useState<BookingRow | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Filter & sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<BookingStatusFilter>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatusFilter>("all");
  const [sort, setSort] = useState<SortState>({ field: "id", direction: "asc" });

  // Derived / filtered rows
  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const bookingStatusValue = BOOKING_STATUS_MAP[bookingStatusFilter];
    const paymentStatusValue = PAYMENT_STATUS_MAP[paymentStatusFilter];

    let result = bookingsRow.filter((item) => {
      const matchesSearch =
        query === "" ||
        item.full_name.toLowerCase().includes(query) ||
        String(item.id).includes(query) ||
        (item.vehicles?.model ?? "").toLowerCase().includes(query) ||
        item.phone_number.toLowerCase().includes(query);

      const matchesBookingStatus =
        bookingStatusValue === null || item.booking_status === bookingStatusValue;

      const matchesPaymentStatus =
        paymentStatusValue === null || item.payment_status === paymentStatusValue;

      return matchesSearch && matchesBookingStatus && matchesPaymentStatus;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sort.field === "id") {
        cmp = a.id - b.id;
      } else if (sort.field === "full_name") {
        cmp = a.full_name.localeCompare(b.full_name);
      } else if (sort.field === "amount") {
        cmp = a.amount - b.amount;
      } else if (sort.field === "rental_date") {
        cmp = new Date(a.rental_date).getTime() - new Date(b.rental_date).getTime();
      } else if (sort.field === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });

    return result;
  }, [bookingsRow, searchQuery, bookingStatusFilter, paymentStatusFilter, sort]);

  function handleSortToggle(field: SortField) {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "asc" };
    });
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sort.field !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
    return sort.direction === "asc"
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />;
  }

  // Handlers
  async function onRowAdd(row: BookingRow | null) {
    if (!row) return;
    setBookingsRow(prev => [row, ...prev]);
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
    async function fetchVehicles() {
      const data = await getAllVehicles();
      setVehiclesRow(data ?? []);
    }

    fetchVehicles();
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        const data = await getAllPaymentMethods();
        setPaymentMethodRows(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Payment Methods", {
          description: error instanceof Error ? error.message : String(error)
        });
      }
    }

    fetchPaymentMethods();
  }, []);

  const hasActiveFilters = searchQuery || bookingStatusFilter !== "all" || paymentStatusFilter !== "all";

  return (
    <div className="space-y-4 bg-card border border-border p-5 rounded-xl">
      <AdminEditBookingDialog
        paymentMethodRows={paymentMethodRows}
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

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Bookings</h2>
          {!loading && (
            <Badge variant="secondary" className="text-xs">
              {filteredRows.length} / {bookingsRow.length}
            </Badge>
          )}
        </div>
        <AdminAddBookingDialog
          paymentMethodRows={paymentMethodRows}
          bookingsRow={bookingsRow}
          vehiclesRow={vehiclesRow}
          onRowAdd={onRowAdd}
        />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="bookings-search"
            type="search"
            placeholder="Search by name, vehicle, ID or phone…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select
          items={BOOKING_STATUS_OPTIONS}
          value={bookingStatusFilter}
          onValueChange={(val) => setBookingStatusFilter(val as BookingStatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-[200px]" id="bookings-status-filter">
            <SelectValue placeholder="Filter by booking status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {BOOKING_STATUS_OPTIONS.map((option) => (
                <SelectItem
                  key={`booking-status-filter-${option.value}`}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          items={PAYMENT_STATUS_OPTIONS}
          value={paymentStatusFilter}
          onValueChange={(val) => setPaymentStatusFilter(val as PaymentStatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-[190px]" id="bookings-payment-filter">
            <SelectValue placeholder="Filter by payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <SelectItem
                  key={`payment-status-filter-${option.value}`}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <button
                  onClick={() => handleSortToggle("id")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Booking ID {SortIcon({ field: "id" })}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("created_at")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Booked At {SortIcon({ field: "created_at" })}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("full_name")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Full Name {SortIcon({ field: "full_name" })}
                </button>
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide">Vehicle</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("rental_date")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Rental Date {SortIcon({ field: "rental_date" })}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("amount")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Amount {SortIcon({ field: "amount" })}
                </button>
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide">Payment</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-end text-xs font-medium uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading &&
              [1, 2, 3, 4, 5].map((item) => (
                <TableRow key={`bookings-table-skeleton-${item}`}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="flex justify-end"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}

            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-8 w-8 opacity-30" />
                    <p className="text-sm font-medium">
                      {bookingsRow.length === 0
                        ? "No bookings found. Add your first booking to get started."
                        : "No bookings match your current filters."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setBookingStatusFilter("all");
                          setPaymentStatusFilter("all");
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredRows.map((item) => {
                const formattedCreatedAt = new Date(item.created_at).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                });

                const formattedRentalDate = new Date(item.rental_date).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <TableRow key={`bookings-table-item-${item.id}`} className="group">
                    <TableCell className="font-mono text-sm text-muted-foreground">#{item.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formattedCreatedAt}</TableCell>
                    <TableCell className="font-medium">{item.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.vehicles?.model ?? "—"}
                      {item.vehicles?.vehicle_colors?.name && (
                        <span className="text-xs text-muted-foreground/70 ml-1">
                          ({item.vehicles.vehicle_colors.name})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formattedRentalDate}</TableCell>
                    <TableCell className="font-medium text-sm">
                      {item.amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                    </TableCell>
                    <TableCell>
                      {item.payment_status === 1 && <Badge>Paid</Badge>}
                      {item.payment_status === 2 && <Badge variant="secondary">Partially Paid</Badge>}
                      {item.payment_status === 3 && <Badge variant="outline">Pending</Badge>}
                    </TableCell>
                    <TableCell>
                      {item.booking_status === 1 && <Badge>Completed</Badge>}
                      {item.booking_status === 3 && <Badge variant="secondary">Reserved</Badge>}
                      {item.booking_status === 6 && <Badge variant="secondary">On-Going</Badge>}
                      {item.booking_status === 2 && <Badge variant="outline">Change Unit</Badge>}
                      {item.booking_status === 4 && <Badge variant="outline">Rescheduled</Badge>}
                      {item.booking_status === 5 && <Badge variant="destructive">Cancelled</Badge>}
                    </TableCell>
                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-60 group-hover:opacity-100 transition-opacity"
                            id={`booking-actions-${item.id}`}
                          >
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Row Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setDetailsBookingRow(item)}>Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUpdateBookingRow(item)}>Edit</DropdownMenuItem>
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Booking Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(1, item.id)}>Completed</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(3, item.id)}>Reserved</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(6, item.id)}>On-Going</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onRowBookingStatusUpdate(2, item.id)}>Change Unit</DropdownMenuItem>
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

      {/* Footer count */}
      {!loading && bookingsRow.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filteredRows.length} of {bookingsRow.length} booking{bookingsRow.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}