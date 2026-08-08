"use client";

import { useState } from "react";
import { registerPlugin } from "react-filepond";

import { AdminSidebar } from "@/components/layouts/admin-sidebar";
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
  const [vehicleColors, setVehicleColors] = useState<VehicleColorRow[]>([]);

  return (
    <>
      <AdminSidebar />

      <main className="w-full">
        <AdminResponsiveSidebarTrigger />

        <section className="space-y-6 m-4 md:m-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold">Vehicles</h2>
          <Bubble variant="tinted">
            <BubbleContent>
              To keep your data accurate, vehicles with booking history cannot be deleted. You can edit the existing vehicle details instead.
            </BubbleContent>
          </Bubble>
          <AdminVehiclesTable vehicleColors={vehicleColors} />
        </section>

        <section className="space-y-6 m-4 md:m-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold">Colors</h2>
          <Bubble variant="tinted">
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