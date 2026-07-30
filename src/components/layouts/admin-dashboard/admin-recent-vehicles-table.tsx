import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { VehicleRow } from "@/types/models.types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Props = {
  supabaseClient: SupabaseClient<Database>;
};

export default function AdminRecentVehiclesTable({ supabaseClient }: Props) {
  // States
  const [loading, setLoading] = useState(false);
  const [vehicleRows, setVehicleRows] = useState<VehicleRow[]>([]);

  // Use effects
  useEffect(() => {
    if (vehicleRows.length > 0) return;

    async function fetchVehicles() {
      setLoading(true);

      try {
        const { data, error } = await supabaseClient
          .from("vehicles")
          .select("*, vehicle_colors(name)")
          .order("created_at", { ascending: false });

        if (error)
          return toast.error("Failed to Fetch Vehicles", { description: error.message });

        const updatedVehicleRow: VehicleRow[] = data.map(e => {
          const { data: publicUrlData } = supabaseClient
            .storage
            .from("vehicles")
            .getPublicUrl (e.image);

          return {
            ...e,
            imageUrl: publicUrlData.publicUrl
          }
        });

        setVehicleRows(updatedVehicleRow);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  return (
    <Table className="max-h-[750px]">
      <TableCaption>A list of your Vehicles</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Vehicle ID</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Color</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading && [1, 2, 3, 4, 5].map(item => (
          <TableRow key={`vehicles-table-skeleton-${item}`}>
            <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
            <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
            <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
            <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
            <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
          </TableRow>
        ))}

        {!loading && vehicleRows.map(item => {
          const formattedCreatedAt = new Date(item.created_at).toLocaleDateString("en-PH", {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          });

          return (
            <TableRow key={`vehicle-item-${item.id}`}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{formattedCreatedAt}</TableCell>
              <TableCell>{item.model}</TableCell>
              <TableCell>{item.vehicle_colors?.name}</TableCell>
              <TableCell>
                {item.status === 1 ? (
                  <Badge variant="secondary">Available</Badge>
                ) : (
                  <Badge variant="destructive">Under Maintenance</Badge>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}