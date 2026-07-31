import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontalIcon } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getAllVehicles } from "@/lib/supabase/tables/vehicles-tables";

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

  // Handlers
  function onRowAdd(row: VehicleRow | null) {
    if (!row) return;
    setVehicleRows(prev => [...prev, row]);
  }

  function onRowDelete(row: VehicleRow | null) {
    setDeleteRow(undefined);
    if (!row) return;
    setVehicleRows(prev => prev.filter(e => e.id !== row.id));
  }

  function onRowUpdate(row: VehicleRow | null) {
    setUpdateRow(undefined);
    if (!row) return;
    setVehicleRows(prev =>
      prev.map(e =>
        e.id === row.id ? row : e
      )
    );
  }

  // Use effects
  useEffect(() => {
    if (vehicleRows.length > 0) return;

    async function fetchVehicles() {
      setLoading(true);

      try {
        const data = await getAllVehicles();
        setVehicleRows(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Vehicles", {
          description: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  return (
    <div className="space-y-3 bg-card border border-border p-4 rounded-xl">
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
        slides={[
          { src: imagePreviewUrl ?? "" }
        ]}
      />
      
      <div className="flex">
        <AdminAddVehicleDialog
          vehicleColors={vehicleColors}
          onRowAdd={onRowAdd}
        />
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