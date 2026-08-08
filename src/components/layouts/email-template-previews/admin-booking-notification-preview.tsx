"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  ADMIN_BOOKING_NOTIFICATION_TEMPLATE_PATH,
  SAMPLE_ADMIN_BOOKING_NOTIFICATION,
  applyEmailTemplatePlaceholders,
} from "@/lib/helpers/email-template-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const AdminBookingNotificationPreview = () => {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTemplatePreview() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(ADMIN_BOOKING_NOTIFICATION_TEMPLATE_PATH);

      if (!response.ok) {
        throw new Error("Failed to load the email template file.");
      }

      const rawHtml = await response.text();
      const filledHtml = applyEmailTemplatePlaceholders(
        rawHtml,
        SAMPLE_ADMIN_BOOKING_NOTIFICATION,
      );

      setPreviewHtml(filledHtml);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load email preview.";
      setError(message);
      setPreviewHtml("");
      toast.error("Email Preview Failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTemplatePreview();
  }, []);

  return (
    <Card className="border border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold font-heading">
                Admin Booking Notification
              </CardTitle>
              <CardDescription className="mt-1">
                Preview of the email sent to admins when a customer submits a new
                booking. Placeholders are filled with sample data.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadTemplatePreview()}
            disabled={loading}
            className="gap-2 shrink-0 self-start"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading && !previewHtml ? (
          <div className="flex min-h-[480px] items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading email preview…</span>
          </div>
        ) : error && !previewHtml ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadTemplatePreview()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <div className="bg-muted/30 p-3 md:p-4">
            <div className="mx-auto max-w-[640px] overflow-hidden rounded-xl border border-border/60 bg-[#090b0c] shadow-sm">
              <iframe
                title="Admin booking notification email preview"
                srcDoc={previewHtml}
                className="block h-[720px] w-full border-0 bg-[#090b0c]"
                sandbox=""
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
