import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontalIcon } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import Lightbox from "yet-another-react-lightbox";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminAddVehicleDialog from "@/components/layouts/vehicles-table/admin-add-vehicle-dialog";
import { VehicleColorRow, VehicleRow } from "@/types/models.types";
import { Database } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import AdminDeleteVehicleDialog from "@/components/layouts/vehicles-table/admin-delete-vehicle-dialog";
import AdminEditVehicleDialog from "@/components/layouts/vehicles-table/admin-edit-vehicle-dialog";
import AdminDetailsVehicleDialog from "@/components/layouts/vehicles-table/admin-details-vehicle-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type Props = {
  supabaseClient: SupabaseClient<Database>;
  vehicleColors: VehicleColorRow[];
};

export default function AdminVehiclesTable({ supabaseClient, vehicleColors }: Props) {
  // States
  const [vehicleRows, setVehicleRows] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteRow, setDeleteRow] = useState<VehicleRow | undefined>(undefined);
  const [updateRow, setUpdateRow] = useState<VehicleRow | undefined>(undefined);
  const [detailsRow, setDetailsRow] = useState<VehicleRow | undefined>(undefined);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(undefined);

  // Handlers
  function onRowAdd(row: VehicleRow) {
    const { data } = supabaseClient
      .storage
      .from("vehicles")
      .getPublicUrl(row.image);

    setVehicleRows(prev => [...prev, { ...row, imageUrl: data.publicUrl }]);
  }

  function onRowDelete(row: VehicleRow) {
    setDeleteRow(undefined);
    setVehicleRows(prev => prev.filter(e => e.id !== row.id));
  }

  function onRowUpdate(row: VehicleRow) {
    setUpdateRow(undefined);

    const { data } = supabaseClient
      .storage
      .from("vehicles")
      .getPublicUrl(row.image);

    setVehicleRows(prev =>
      prev.map(e =>
        e.id === row.id ? { ...row, imageUrl: data.publicUrl } : e
      )
    );
  }

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
  }, [supabaseClient]);

  return (
    <div className="space-y-3 bg-card border border-border p-4 rounded-xl">
      <AdminDeleteVehicleDialog supabaseClient={supabaseClient}
                                row={deleteRow}
                                onRowDelete={onRowDelete}
                                onCancel={() => setDeleteRow(undefined)} />
      <AdminEditVehicleDialog supabaseClient={supabaseClient}
                              vehicleColors={vehicleColors}
                              row={updateRow}
                              onRowUpdate={onRowUpdate}
                              onCancel={() => setUpdateRow(undefined)} />
      <AdminDetailsVehicleDialog row={detailsRow}
                                 onClose={() => setDetailsRow(undefined)} />
      <Lightbox open={!!imagePreviewUrl}
                close={() => setImagePreviewUrl(undefined)}
                slides={[
                  { src: imagePreviewUrl ?? "" }
                ]} />
      
      <div className="flex">
        <AdminAddVehicleDialog vehicleColors={vehicleColors}
                               supabaseClient={supabaseClient}
                               onRowAdd={onRowAdd} />
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
          {loading && [1, 2, 3, 4, 5].map(item => (
            <TableRow key={`vehicles-table-skeleton-${item}`}>
              <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
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
                <TableCell className="text-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost"><MoreHorizontalIcon/></Button>} />
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