import { toast } from "sonner";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontalIcon, Palette, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminAddColorDialog from "@/components/layouts/vehicle-colors-table/admin-add-color-dialog";
import { VehicleColorRow } from "@/types/models.types";
import { Button } from "@/components/ui/button";
import AdminDeleteColorDialog from "@/components/layouts/vehicle-colors-table/admin-delete-color-dialog";
import AdminEditColorDialog from "@/components/layouts/vehicle-colors-table/admin-edit-color-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllVehicleColors } from "@/lib/supabase/tables/vehicle-colors-table";

type SortField = "id" | "name" | "created_at";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

type Props = {
  onVehicleColorsFetch: (e: VehicleColorRow[]) => void;
  onVehicleColorsUpdate: (e: VehicleColorRow[]) => void;
  onVehicleColorsDelete: (e: VehicleColorRow[]) => void;
};

export default function AdminColorsTable({ onVehicleColorsFetch, onVehicleColorsDelete, onVehicleColorsUpdate }: Props) {

  // States
  const [vehicleColors, setVehicleColors] = useState<VehicleColorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteRow, setDeleteRow] = useState<VehicleColorRow | undefined>(undefined);
  const [updateRow, setUpdateRow] = useState<VehicleColorRow | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "id", direction: "asc" });

  // Handlers
  function onRowAdd(row: VehicleColorRow | null) {
    if (!row) return;
    setVehicleColors((prev) => [row, ...prev]);
  }

  function onRowDelete(row: VehicleColorRow | null) {
    setDeleteRow(undefined);
    if (!row) return;
    setVehicleColors((prev) => prev.filter((e) => e.id !== row.id));
    onVehicleColorsDelete(vehicleColors);
  }

  function onRowUpdate(row: VehicleColorRow | null) {
    setUpdateRow(undefined);
    if (!row) return;
    setVehicleColors((prev) =>
      prev.map((e) =>
        e.id === row.id ? row : e
      )
    );
    onVehicleColorsUpdate(vehicleColors);
  }

  function handleSortToggle(field: SortField) {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "asc" };
    });
  }

  // Derived data
  const filteredAndSorted = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = vehicleColors.filter((c) =>
      query === "" ||
      c.name.toLowerCase().includes(query) ||
      String(c.id).includes(query)
    );

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sort.field === "id") {
        cmp = a.id - b.id;
      } else if (sort.field === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sort.field === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });

    return result;
  }, [vehicleColors, searchQuery, sort]);

  // Use effects
  useEffect(() => {
    async function fetchVehicleColors() {
      setLoading(true);

      try {
        const data = await getAllVehicleColors();
        setVehicleColors(data ?? []);
        onVehicleColorsFetch(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Vehicle Colors", {
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVehicleColors();
  }, []);

  function SortIcon({ field }: { field: SortField }) {
    if (sort.field !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
    return sort.direction === "asc"
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />;
  }

  return (
    <div className="space-y-4 bg-card border border-border p-5 rounded-xl">
      <AdminDeleteColorDialog
        row={deleteRow}
        onRowDelete={onRowDelete}
        onCancel={() => setDeleteRow(undefined)}
      />
      <AdminEditColorDialog
        row={updateRow}
        onRowUpdate={onRowUpdate}
        onCancel={() => setUpdateRow(undefined)}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Vehicle Colors</h2>
          {!loading && (
            <Badge variant="secondary" className="text-xs">
              {filteredAndSorted.length} / {vehicleColors.length}
            </Badge>
          )}
        </div>
        <AdminAddColorDialog onRowAdd={onRowAdd} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="vehicle-colors-search"
          type="search"
          placeholder="Search by name or ID…"
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
                  Color ID {SortIcon({ field: "id" })}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("created_at")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Created At {SortIcon({ field: "created_at" })}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("name")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Name {SortIcon({ field: "name" })}
                </button>
              </TableHead>
              <TableHead className="text-end text-xs font-medium uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && [1, 2, 3, 4, 5].map(item => (
              <TableRow key={`vehicle-colors-table-skeleton-${item}`}>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell className="flex justify-end"><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}

            {!loading && filteredAndSorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Palette className="h-8 w-8 opacity-30" />
                    <p className="text-sm font-medium">
                      {searchQuery ? "No colors match your search." : "No vehicle colors found."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredAndSorted.map(item => {
              const formattedCreatedAt = new Date(item.created_at).toLocaleDateString("en-PH", {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              });

              return (
                <TableRow key={`vehicle-colors-item-${item.id}`} className="group">
                  <TableCell className="font-mono text-sm text-muted-foreground">#{item.id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formattedCreatedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="opacity-60 group-hover:opacity-100 transition-opacity" id={`vehicle-color-actions-${item.id}`}><MoreHorizontalIcon className="h-4 w-4" /></Button>} />
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Row Actions</DropdownMenuLabel>
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
      {!loading && vehicleColors.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filteredAndSorted.length} of {vehicleColors.length} color{vehicleColors.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}