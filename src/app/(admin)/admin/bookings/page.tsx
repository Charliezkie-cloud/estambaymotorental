"use client";

import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";
import AdminBookingsTable from "@/components/layouts/bookings-table/admin-bookings-table";

import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import "filepond/dist/filepond.min.css";
import "yet-another-react-lightbox/styles.css";
import { registerPlugin } from "react-filepond";

// Register filepond plugins
registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
);

export default function AdminBookingsPage() {
  return (
    <>
      <AdminSidebar />

      <main className="w-full">
        <AdminResponsiveSidebarTrigger />

        <section className="space-y-6 m-4 md:m-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold">Bookings</h2>
          <AdminBookingsTable />
        </section>

      </main>
    </>
  );
}