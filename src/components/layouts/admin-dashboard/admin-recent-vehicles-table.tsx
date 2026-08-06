"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VehicleRow } from "@/types/models.types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getAllVehicles } from "@/lib/supabase/tables/vehicles-tables";
import { Bike } from "lucide-react";

export default function AdminRecentVehiclesTable() {
  // States
  const [loading, setLoading] = useState(true);
  const [vehicleRows, setVehicleRows] = useState<VehicleRow[]>([]);

  // Use effects
  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);

      try {
        const data = await getAllVehicles(10);
        setVehicleRows(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Recently Added Vehicles", {
          description: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs uppercase tracking-wider">
            <TableHead className="font-semibold py-3">ID</TableHead>
            <TableHead className="font-semibold py-3">Model</TableHead>
            <TableHead className="font-semibold py-3">Color</TableHead>
            <TableHead className="font-semibold py-3 text-center">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && [1, 2, 3, 4, 5].map((item) => (
            <TableRow key={`vehicles-table-skeleton-${item}`}>
              <TableCell><Skeleton className="h-5 w-12" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
            </TableRow>
          ))}

          {!loading && vehicleRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Bike className="w-6 h-6 opacity-40" />
                  <p className="text-sm">No vehicles found in fleet.</p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!loading && vehicleRows.map((item) => {
            return (
              <TableRow key={`vehicle-item-${item.id}`} className="hover:bg-muted/30 transition-colors text-xs md:text-sm">
                <TableCell className="font-mono font-medium text-xs text-muted-foreground">
                  #{item.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block truncate max-w-[150px]" title={item.model}>
                        {item.model}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {item.year_model} model
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-secondary-foreground">
                    {item.vehicle_colors?.name ?? "Standard"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {item.status === 1 ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25">
                      Available
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25">
                      Maintenance
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}