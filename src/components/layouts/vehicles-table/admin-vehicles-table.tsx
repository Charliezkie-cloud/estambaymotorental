import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontalIcon, SearchIcon } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

interface StatusFilterOption {
  value: StatusFilter;
  label: string;
}

const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: "all", label: "All" },
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

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Derived / filtered rows
  const filteredRows = useMemo(() => {
    return vehicleRows.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && item.status === 1) ||
        (statusFilter === "maintenance" && item.status === 2);

      return matchesSearch && matchesStatus;
    });
  }, [vehicleRows, searchQuery, statusFilter]);

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
    <div className="space-y-4 bg-card border border-border p-4 rounded-xl">
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

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="vehicles-search"
              type="search"
              placeholder="Search by model..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            items={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as StatusFilter)}
          >
            <SelectTrigger className="w-[180px]" id="vehicles-status-filter">
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

        <AdminAddVehicleDialog vehicleColors={vehicleColors} onRowAdd={onRowAdd} />
      </div>

      <Table className="max-h-[750px]">
        <TableCaption>A list of your Vehicles</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle ID</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-end">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading &&
            [1, 2, 3, 4, 5].map((item) => (
              <TableRow key={`vehicles-table-skeleton-${item}`}>
                <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[160px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[140px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[110px]" /></TableCell>
                <TableCell className="text-end"><Skeleton className="h-6 w-[60px] ml-auto" /></TableCell>
              </TableRow>
            ))}

          {!loading && filteredRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                {vehicleRows.length === 0
                  ? "No vehicles found. Add your first vehicle to get started."
                  : "No vehicles match your current filters."}
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
                <TableRow key={`vehicle-item-${item.id}`}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{formattedCreatedAt}</TableCell>
                  <TableCell>{item.model}</TableCell>
                  <TableCell>{item.vehicle_colors?.name ?? "—"}</TableCell>
                  <TableCell>
                    {item.status === 1 && <Badge>Available</Badge>}
                    {item.status === 2 && <Badge variant="destructive">Under Maintenance</Badge>}
                  </TableCell>
                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" id={`vehicle-actions-${item.id}`}><MoreHorizontalIcon /></Button>} />
                      <DropdownMenuContent>
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
  );
}