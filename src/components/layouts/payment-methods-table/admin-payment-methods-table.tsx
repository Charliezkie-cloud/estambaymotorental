import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { PaymentMethodRow } from "@/types/models.types";
import { toast } from "sonner";
import { getAllPaymentMethods } from "@/lib/supabase/tables/payment-methods-table";
import AdminAddPaymentMethodDialog from "@/components/layouts/payment-methods-table/admin-add-payment-method-dialog";
import AdminEditPaymentMethodDialog from "@/components/layouts/payment-methods-table/admin-edit-payment-method-dialog";
import Lightbox from "yet-another-react-lightbox";
import AdminDeletePaymentMethodDialog
  from "@/components/layouts/payment-methods-table/admin-delete-payment-method-dialog";

export default function AdminPaymentMethodsTable() {
  // States
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[]>([]);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [paymentMethodUpdate, setPaymentMethodUpdate] = useState<PaymentMethodRow | undefined>(undefined);
  const [paymentMethodDelete, setPaymentMethodDelete] = useState<PaymentMethodRow | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Handlers
  function onRowAdd(row: PaymentMethodRow | null) {
    if (!row) return;
    setPaymentMethods(prev => [...prev, row]);
  }

  function onRowUpdate(row: PaymentMethodRow | null) {
    if (!row) return;
    setPaymentMethods(prev => prev.map(e => e.id === row.id ? row : e));
    setPaymentMethodUpdate(undefined);
  }

  function onRowDelete(row: PaymentMethodRow | null) {
    if (!row) return;
    setPaymentMethods(prev => prev.filter(e => e.id !== row.id));
    setPaymentMethodDelete(undefined);
  }

  // Use effects
  useEffect(() => {
    if (paymentMethods.length > 0) return;

    async function fetchPaymentMethods() {
      setLoading(true);

      try {
        const data = await getAllPaymentMethods();
        setPaymentMethods(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Payment Methods", {
          description: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentMethods();
  }, []);

  return (
    <>
      {imagePreview && (
        <Lightbox
          open={!!imagePreview}
          close={() => setImagePreview(undefined)}
          slides={[{ src: imagePreview }]}
        />
      )}

      <div className="space-y-3 bg-card border border-border p-4 rounded-xl">
        <AdminEditPaymentMethodDialog
          row={paymentMethodUpdate}
          onRowUpdate={onRowUpdate}
          onCancel={() => setPaymentMethodUpdate(undefined)}
        />
        <AdminDeletePaymentMethodDialog
          row={paymentMethodDelete}
          onRowDelete={onRowDelete}
          onCancel={() => setPaymentMethodDelete(undefined)}
        />

        <div className="flex">
          <AdminAddPaymentMethodDialog onRowAdd={onRowAdd} />
        </div>

        <Table className="max-h-[750px]">
          <TableCaption>A list of your Payment Methods</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Method ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && [1, 2, 3, 4, 5].map(item => (
              <TableRow key={`payment-methods-table-skeleton-${item}`}>
                <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
              </TableRow>
            ))}

            {!loading && paymentMethods.map((item) => {
              const formattedCreatedAt = new Date(item.created_at).toLocaleDateString("en-PH", {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              });

              return (
                <TableRow key={`payment-methods-item-${item.id}`}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{formattedCreatedAt}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost"><MoreHorizontalIcon/></Button>} />
                      <DropdownMenuContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Row Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setImagePreview(item.qr_code_image_url)}>View QR Code</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPaymentMethodUpdate(item)}>Edit</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem variant="destructive" onClick={() => setPaymentMethodDelete(item)}>Delete</DropdownMenuItem>
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
    </>
  );
}