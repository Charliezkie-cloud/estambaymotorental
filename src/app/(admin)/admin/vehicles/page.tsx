"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { registerPlugin } from "react-filepond";

import AdminSidebar from "@/components/layouts/admin-sidebar";
import { supabaseClient } from "@/lib/supabase/supabase-client";
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
import "yet-another-react-lightbox/styles.css";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

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
          <h2 className="font-heading text-xl md:text-2xl font-bold">Vehicles</h2>
          <Bubble variant="secondary">
            <BubbleContent>
              To keep your data accurate, vehicles with booking history cannot be deleted. You can edit the existing vehicle details instead.
            </BubbleContent>
          </Bubble>
          <AdminVehiclesTable vehicleColors={vehicleColors} />
        </section>

        <section className="space-y-6 m-4 md:m-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold">Colors</h2>
          <Bubble variant="secondary">
            <BubbleContent>
              To keep your data accurate and organized, colors with existing vehicles cannot be deleted. You can edit the existing color details instead.
            </BubbleContent>
          </Bubble>
          <AdminColorsTable
            onVehicleColorsFetch={(e) => setVehicleColors(e)}
            onVehicleColorsDelete={e => setVehicleColors(e)}
            onVehicleColorsUpdate={e => setVehicleColors(e)}
          />
        </section>

      </main>
    </>
  );
}