import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FilePond } from "react-filepond";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { FilePondFile } from "filepond";
import { PaymentMethodRow } from "@/types/models.types";
import { toast } from "sonner";
import { deleteQrCode, updatePaymentMethod } from "@/lib/supabase/tables/payment-methods-table";

type Props = {
  row?: PaymentMethodRow;
  onRowUpdate: (e: PaymentMethodRow | null) => void;
  onCancel: () => void;
};

const REQUIRED = <span className="text-destructive font-bold ms-0.5">*</span>;

export default function AdminEditPaymentMethodDialog({ row, onRowUpdate, onCancel }: Props) {
  // Form states
  const [name, setName] = useState("");
  const [qrCodeImages, setQrCodeImages] = useState<FilePondFile[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingQr, setDeletingQr] = useState(false);

  // Handlers
  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!row) return;
    setLoading(true);

    if (name.trim().length < 1) {
      toast.error("Invalid Form Input", { description: "Payment Method name is required." });
      return setLoading(false);
    }

    try {
      const data = await updatePaymentMethod({
        id: row.id,
        name: name.trim(),
        ...(qrCodeImages && {
          oldImage: row.qr_code_image ?? "",
          newImage: qrCodeImages[0].file,
        }),
      });

      toast.success("Payment Method Updated Successfully");
      onRowUpdate(data);
    } catch (error) {
      toast.error("Failed to Update Payment Method", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteQrCode() {
    if (!row) return;
    setDeletingQr(true);

    try {
      const data = await deleteQrCode(row.id);

      if (!data) {
        toast.error("Failed to Delete QR Code", { description: "QR code not found." });
        return;
      }

      toast.success("QR Code Deleted Successfully");
      onRowUpdate(data);
    } catch (error) {
      toast.error("Failed to Delete QR Code", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setDeletingQr(false);
    }
  }

  // Use effects
  useEffect(() => {
    function mapFormStates() {
      if (!row) return;
      setName(row.name);
      setQrCodeImages(null);
    }

    mapFormStates();
  }, [row]);

  return (
    <Dialog open={!!row}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Payment Method</DialogTitle>
          <DialogDescription className="mt-0.5">
            Update the details for this payment method.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onFormSubmit} id="edit-payment-method-form">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit_payment_method_name">Name {REQUIRED}</FieldLabel>
                <Input
                  id="edit_payment_method_name"
                  type="text"
                  name="payment_method_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  placeholder="e.g. GCash"
                  required
                  autoFocus
                />
                <FieldDescription>Enter a label for this payment method option.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="edit_qr_code_image">QR Code Image</FieldLabel>
                <FilePond
                  name="qr_code_image"
                  onupdatefiles={setQrCodeImages}
                  allowMultiple={false}
                  acceptedFileTypes={["image/*"]}
                  maxFileSize="10MB"
                  allowFileTypeValidation
                  allowFileSizeValidation
                  className="filepond--dark"
                />
                {row?.qr_code_image && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={loading || deletingQr}
                    onClick={onDeleteQrCode}
                    className="mt-2 w-fit"
                  >
                    {deletingQr ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        Deleting…
                      </>
                    ) : (
                      "Delete QR Code"
                    )}
                  </Button>
                )}
                <FieldDescription>
                  Optional. Leave empty to keep the existing QR code unchanged.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter>
          <DialogClose onClick={onCancel}>Cancel</DialogClose>
          <Button
            type="submit"
            form="edit-payment-method-form"
            disabled={loading || deletingQr}
            className="min-w-20"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
