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
import { updatePaymentMethod } from "@/lib/supabase/tables/payment-methods-table";

type Props = {
  row?: PaymentMethodRow;
  onRowUpdate: (e: PaymentMethodRow | null) => void;
  onCancel: () => void;
};

export default function AdminEditPaymentMethodDialog({ row, onRowUpdate, onCancel }: Props) {
  // Form states
  const [name, setName] = useState<string | undefined>(undefined);
  const [qrCodeImages, setQrCodeImages] = useState<FilePondFile[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!row) return;
    setLoading(true);

    const validationMessage = validateForm();

    if (typeof validationMessage === "string")
      return toast.error("Invalid Form Input", { description: validationMessage });

    try {
      const data = await updatePaymentMethod({
        id: row.id,
        name: name ?? "",
        ...(qrCodeImages && {
          oldImage: row.qr_code_image ?? "",
          newImage: qrCodeImages[0].file
        })
      });

      toast.success("Payment Method Added Successfully");
      onRowUpdate(data);
    } catch (error) {
      toast.error("Failed to Add Payment Method", {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  }

  // Helpers
  function validateForm(): string | boolean {
    if (name && name.length < 1) return "Payment Method name is required.";

    return false;
  }

  // Use effects
  useEffect(() => {
    function mapFormStates() {
      if (!row) return;
      setName(row.name);
    }

    mapFormStates();
  }, [row]);

  return (
    <Dialog open={!!row}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Payment Method</DialogTitle>
          <DialogDescription>Edit a payment method.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onFormSubmit} id="edit-payment-method-form">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="payment_method_name">Name <span className="text-red-400 font-bold">*</span></FieldLabel>
                <Input type="text" name="payment_method_name" value={name ?? ""} onChange={e => setName(e.target.value)} autoComplete="off" placeholder="e.g. GCash" required />
                <FieldDescription>Enter a label for this payment method option.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="qr_code_image">QR Code Image <span className="text-red-400 font-bold">*</span></FieldLabel>
                <FilePond name="qr_code_image"
                          onupdatefiles={setQrCodeImages}
                          allowMultiple={false}
                          acceptedFileTypes={["image/*"]}
                          maxFileSize="10MB"
                          allowFileTypeValidation
                          allowFileSizeValidation
                          className="filepond--dark" />
                <FieldDescription>Leave this input empty if the payment method doesn&#39;t need a QR Code.</FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
        <DialogFooter className="space-x-2">
          <DialogClose onClick={onCancel}>Cancel</DialogClose>
          <Button type="submit" form="edit-payment-method-form" disabled={loading}>Save {loading && <Loader2 className="animate-spin" />}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}