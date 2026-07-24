import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminAddColorDialog from "@/components/layouts/vehicle-colors-table/admin-add-color-dialog";
import { VehicleColorRow } from "@/types/models.types";
import { Button } from "@/components/ui/button";
import AdminDeleteColorDialog from "@/components/layouts/vehicle-colors-table/admin-delete-color-dialog";
import AdminEditColorDialog from "@/components/layouts/vehicle-colors-table/admin-edit-color-dialog";
import { Database } from "@/types/database.types";

type Props = {
  supabaseClient: SupabaseClient<Database>;
  onVehicleColorsFetch: (e: VehicleColorRow[]) => void;
};

export default function AdminColorsTable({ supabaseClient, onVehicleColorsFetch }: Props) {

  // States
  const [vehicleColors, setVehicleColors] = useState<VehicleColorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteRow, setDeleteRow] = useState<VehicleColorRow | undefined>(undefined);
  const [updateRow, setUpdateRow] = useState<VehicleColorRow | undefined>(undefined);

  // Handlers
  function onRowAdd(row: VehicleColorRow) {
    setVehicleColors(prev => ([...prev, row]));
  }

  function onRowDelete(row: VehicleColorRow) {
    setDeleteRow(undefined);
    setVehicleColors(prev => prev.filter(e => e.id !== row.id));
  }

  function onRowUpdate(row: VehicleColorRow) {
    setUpdateRow(undefined);
    setVehicleColors(prev =>
      prev.map(e =>
        e.id === row.id ? row : e
      )
    );
  }

  // Use effects
  useEffect(() => {
    async function fetchVehicleColors() {
      setLoading(true);

      try {
        const { data, error } = await supabaseClient
          .from("vehicle_colors")
          .select("*");

        if (error)
          return toast.error("Unable to Fetch Vehicle Colors", {
            description: error.message
          });

        setVehicleColors(data);
        onVehicleColorsFetch(data);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicleColors();
  }, [supabaseClient]);

  return (
    <div className="space-y-3 bg-card border border-border p-4 rounded-xl">
      <AdminDeleteColorDialog row={deleteRow}
                              supabaseClient={supabaseClient}
                              onRowDelete={onRowDelete}
                              onCancel={() => setDeleteRow(undefined)} />
      <AdminEditColorDialog row={updateRow}
                            supabaseClient={supabaseClient}
                            onRowUpdate={onRowUpdate}
                            onCancel={() => setUpdateRow(undefined)} />

      <div className="flex">
        <AdminAddColorDialog supabaseClient={supabaseClient}
                             onRowAdd={onRowAdd} />
      </div>

      <Table>
        <TableCaption>A list of your vehicle colors</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Created At</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!loading && vehicleColors.map(item => {
            const formattedCreatedAt = new Date(item.created_at).toLocaleDateString("en-PH", {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            });

            return (
              <TableRow key={`vehicle-colors-item-${item.id}`}>
                <TableCell>{formattedCreatedAt}</TableCell>
                <TableCell>{item.name}</TableCell>
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