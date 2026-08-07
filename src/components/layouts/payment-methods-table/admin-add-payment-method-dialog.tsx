import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, PlusIcon } from "lucide-react";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { FilePondFile } from "filepond";
import { FilePond } from "react-filepond";
import { toast } from "sonner";
import { createPaymentMethod } from "@/lib/supabase/tables/payment-methods-table";
import { PaymentMethodRow } from "@/types/models.types";

type Props = {
  onRowAdd: (e: PaymentMethodRow | null) => void;
};

const REQUIRED = <span className="text-destructive font-bold ms-0.5">*</span>;

export default function AdminAddPaymentMethodDialog({ onRowAdd }: Props) {
  // States
  const [open, setOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [qrCodeImages, setQrCodeImages] = useState<FilePondFile[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Handlers
  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    if (name.trim().length < 1) {
      toast.error("Invalid Form Input", { description: "Payment Method name is required." });
      return setLoading(false);
    }

    try {
      const data = await createPaymentMethod({
        name: name.trim(),
        ...(qrCodeImages && { qrCodeImage: qrCodeImages[0].file }),
      });

      setOpen(false);
      toast.success("Payment Method Added Successfully");
      onRowAdd(data);
    } catch (error) {
      toast.error("Failed to Add Payment Method", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  // Use effects
  useEffect(() => {
    function resetForm() {
      if (!open) return;
      setName("");
      setQrCodeImages(null);
    }

    resetForm();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5" id="add-payment-method-trigger">
            <PlusIcon className="h-4 w-4" />
            Add Payment Method
          </Button>
        }
      />

      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription className="mt-0.5">
            Add a new payment method option for customer bookings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onFormSubmit} id="add-payment-method-form">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="payment_method_name">Name {REQUIRED}</FieldLabel>
                <Input
                  id="payment_method_name"
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
                <FieldLabel htmlFor="qr_code_image">QR Code Image</FieldLabel>
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
                <FieldDescription>
                  Optional. Leave empty if this payment method doesn&apos;t need a QR code.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter>
          <DialogClose onClick={() => setOpen(false)}>Cancel</DialogClose>
          <Button type="submit" form="add-payment-method-form" disabled={loading} className="min-w-20">
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
