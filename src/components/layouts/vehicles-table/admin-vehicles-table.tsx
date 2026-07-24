import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import Lightbox from "yet-another-react-lightbox";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminAddVehicleDialog from "@/components/layouts/vehicles-table/admin-add-vehicle-dialog";
import { VehicleColorRow, VehicleRow } from "@/types/models.types";
import { Database } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import AdminDeleteVehicleDialog from "@/components/layouts/vehicles-table/admin-delete-vehicle-dialog";
import AdminEditVehicleDialog from "@/components/layouts/vehicles-table/admin-edit-vehicle-dialog";

import "yet-another-react-lightbox/styles.css";

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
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(undefined);

  // Handlers
  function onRowAdd(row: VehicleRow) {
    setVehicleRows(prev => [...prev, row]);
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

      <Table>
        <TableCaption>A list of your vehicles</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Created At</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Year Model</TableHead>
            <TableHead>Daily Price</TableHead>
            <TableHead>Half Day Price</TableHead>
            <TableHead>Hourly Price</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!loading && vehicleRows.map(item => {
            const formattedCreatedAt = new Date(item.created_at).toLocaleDateString("en-PH", {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            });
            const formattedDailyPrice = item.daily_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
            const formattedHalfDayPrice = item.half_day_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
            const formattedHourlyPrice = item.hourly_price.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

            return (
              <TableRow key={`vehicle-item-${item.id}`}>
                <TableCell>{formattedCreatedAt}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.vehicle_colors.name}</TableCell>
                <TableCell>{item.year_model}</TableCell>
                <TableCell>{formattedDailyPrice}</TableCell>
                <TableCell>{formattedHalfDayPrice}</TableCell>
                <TableCell>{formattedHourlyPrice}</TableCell>
                <TableCell>
                  <Button variant="secondary" onClick={() => setImagePreviewUrl(item.imageUrl)}>View</Button>
                </TableCell>
                <TableCell className="space-x-1">
                  <Button variant="destructive" onClick={() => setDeleteRow(item)}>Delete</Button>
                  <Button variant="secondary" onClick={() => setUpdateRow(item)}>Edit</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  );
}