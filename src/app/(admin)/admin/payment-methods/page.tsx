"use client";

import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import AdminPaymentMethodsTable from "@/components/layouts/payment-methods-table/admin-payment-methods-table";

import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import "filepond/dist/filepond.min.css";
import "yet-another-react-lightbox/styles.css";
import { registerPlugin } from "react-filepond";
import AdminResponsiveSidebarTrigger from "@/components/layouts/admin-responsive-sidebar-trigger";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

// Register filepond plugins
registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
);

export default function AdminPaymentMethodsPage() {
  return (
    <>
      <AdminSidebar />

      <main className="w-full">
        <AdminResponsiveSidebarTrigger />

        <section className="space-y-6 m-4 md:m-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold">Payment Methods</h2>
          <Bubble variant="tinted">
            <BubbleContent>
              To keep your data accurate, payment methods with booking history cannot be deleted. You can edit the existing payment method details instead.
            </BubbleContent>
          </Bubble>
          <AdminPaymentMethodsTable />
        </section>

      </main>
    </>
  );
}