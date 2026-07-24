"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { registerPlugin } from "react-filepond";

import AdminSidebar from "@/components/layouts/admin-sidebar";
import { supabaseClient } from "@/lib/supabase-client";
import { useAuth } from "@/hooks/useAuth";
import AdminVehiclesTable from "@/components/layouts/vehicles-table/admin-vehicles-table";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";
import AdminColorsTable from "@/components/layouts/vehicle-colors-table/admin-colors-table";
import { VehicleColorRow } from "@/types/models.types";

import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import "filepond/dist/filepond.min.css";

// Register filepond plugins
registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
);

export default function AdminVehiclePage() {
  // Hooks
  const { loading, user, error } = useAuth();

  // States
  const [vehicleColors, setVehicleColors] = useState<VehicleColorRow[]>([]);

  // Use effects
  useEffect(() => {
    if (error)
      toast.error("Session Failed", {
        description: error
      });

    if (!loading && !user)
      return redirect("/admin/login");
  }, [loading, user, error]);

  return (
    <>
      <AdminSidebar supabaseClient={supabaseClient} />

      <main className="w-full">
        <AdminResponsiveSidebarTrigger />

        <section className="space-y-6 m-4 md:m-6">
          <h1 className="font-heading text-xl md:text-2xl font-bold">Vehicles</h1>
          <AdminVehiclesTable supabaseClient={supabaseClient}
                              vehicleColors={vehicleColors} />
        </section>

        <section className="space-y-6 m-4 md:m-6">
          <h1 className="font-heading text-xl md:text-2xl font-bold">Colors</h1>
          <AdminColorsTable supabaseClient={supabaseClient}
                            onVehicleColorsFetch={(e) => setVehicleColors(e)} />
        </section>

      </main>
    </>
  );
}