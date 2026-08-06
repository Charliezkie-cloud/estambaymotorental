import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ArrowUpDown, Bike, MoreHorizontalIcon, Search, X } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminAddVehicleDialog from "@/components/layouts/vehicles-table/admin-add-vehicle-dialog";
import { VehicleColorRow, VehicleRow } from "@/types/models.types";
import { Button } from "@/components/ui/button";
import AdminDeleteVehicleDialog from "@/components/layouts/vehicles-table/admin-delete-vehicle-dialog";
import AdminEditVehicleDialog from "@/components/layouts/vehicles-table/admin-edit-vehicle-dialog";
import AdminDetailsVehicleDialog from "@/components/layouts/vehicles-table/admin-details-vehicle-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllVehicles } from "@/lib/supabase/tables/vehicles-tables";

type StatusFilter = "all" | "available" | "maintenance";
type SortField = "id" | "model" | "created_at";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface StatusFilterOption {
  value: StatusFilter;
  label: string;
}

const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "available", label: "Available" },
  { value: "maintenance", label: "Under Maintenance" },
];

type Props = {
  vehicleColors: VehicleColorRow[];
};

export default function AdminVehiclesTable({ vehicleColors }: Props) {
  // States
  const [vehicleRows, setVehicleRows] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteRow, setDeleteRow] = useState<VehicleRow | undefined>(undefined);
  const [updateRow, setUpdateRow] = useState<VehicleRow | undefined>(undefined);
  const [detailsRow, setDetailsRow] = useState<VehicleRow | undefined>(undefined);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(undefined);

  // Filter & sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortState>({ field: "id", direction: "asc" });

  // Derived / filtered rows
  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = vehicleRows.filter((item) => {
      const matchesSearch =
        query === "" ||
        item.model.toLowerCase().includes(query) ||
        String(item.id).includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && item.status === 1) ||
        (statusFilter === "maintenance" && item.status === 2);

      return matchesSearch && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sort.field === "id") {
        cmp = a.id - b.id;
      } else if (sort.field === "model") {
        cmp = a.model.localeCompare(b.model);
      } else if (sort.field === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });

    return result;
  }, [vehicleRows, searchQuery, statusFilter, sort]);

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
  function onRowAdd(row: VehicleRow | null) {
    if (!row) return;
    setVehicleRows((prev) => [row, ...prev]);
  }

  function onRowDelete(row: VehicleRow | null) {
    setDeleteRow(undefined);
    if (!row) return;
    setVehicleRows((prev) => prev.filter((e) => e.id !== row.id));
  }

  function onRowUpdate(row: VehicleRow | null) {
    setUpdateRow(undefined);
    if (!row) return;
    setVehicleRows((prev) =>
      prev.map((e) => (e.id === row.id ? row : e))
    );
  }

  // Use effects
  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);

      try {
        const data = await getAllVehicles();
        setVehicleRows(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Vehicles", {
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  return (
    <div className="space-y-4 bg-card border border-border p-5 rounded-xl">
      <AdminDeleteVehicleDialog
        row={deleteRow}
        onRowDelete={onRowDelete}
        onCancel={() => setDeleteRow(undefined)}
      />
      <AdminEditVehicleDialog
        vehicleColors={vehicleColors}
        row={updateRow}
        onRowUpdate={onRowUpdate}
        onCancel={() => setUpdateRow(undefined)}
      />
      <AdminDetailsVehicleDialog
        row={detailsRow}
        onClose={() => setDetailsRow(undefined)}
      />
      <Lightbox
        open={!!imagePreviewUrl}
        close={() => setImagePreviewUrl(undefined)}
        slides={[{ src: imagePreviewUrl ?? "" }]}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Bike className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Vehicles</h2>
          {!loading && (
            <Badge variant="secondary" className="text-xs">
              {filteredRows.length} / {vehicleRows.length}
            </Badge>
          )}
        </div>
        <AdminAddVehicleDialog vehicleColors={vehicleColors} onRowAdd={onRowAdd} />
      </div>

      {/* Search + Status filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="vehicles-search"
            type="search"
            placeholder="Search by model or ID…"
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
          items={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-[180px]" id="vehicles-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem
                  key={`status-filter-${option.value}`}
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
                  Vehicle ID <SortIcon field="id" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("created_at")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Created At <SortIcon field="created_at" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("model")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Model <SortIcon field="model" />
                </button>
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide">Color</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-end text-xs font-medium uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading &&
              [1, 2, 3, 4, 5].map((item) => (
                <TableRow key={`vehicles-table-skeleton-${item}`}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell className="flex justify-end"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}

            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Bike className="h-8 w-8 opacity-30" />
                    <p className="text-sm font-medium">
                      {vehicleRows.length === 0
                        ? "No vehicles found. Add your first vehicle to get started."
                        : "No vehicles match your current filters."}
                    </p>
                    {(searchQuery || statusFilter !== "all") && (
                      <button
                        onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
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

                return (
                  <TableRow key={`vehicle-item-${item.id}`} className="group">
                    <TableCell className="font-mono text-sm text-muted-foreground">#{item.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formattedCreatedAt}</TableCell>
                    <TableCell className="font-medium">{item.model}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.vehicle_colors?.name ?? "—"}</TableCell>
                    <TableCell>
                      {item.status === 1 && <Badge>Available</Badge>}
                      {item.status === 2 && <Badge variant="destructive">Under Maintenance</Badge>}
                    </TableCell>
                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="opacity-60 group-hover:opacity-100 transition-opacity" id={`vehicle-actions-${item.id}`}><MoreHorizontalIcon className="h-4 w-4" /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Row Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setDetailsRow(item)}>Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUpdateRow(item)}>Edit</DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleteRow(item)}>Delete</DropdownMenuItem>
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
      {!loading && vehicleRows.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filteredRows.length} of {vehicleRows.length} vehicle{vehicleRows.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}