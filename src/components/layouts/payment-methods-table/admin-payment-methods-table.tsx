import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontalIcon,
  Search,
  Wallet,
  X,
} from "lucide-react";
import Lightbox from "yet-another-react-lightbox";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PaymentMethodRow } from "@/types/models.types";
import { getAllPaymentMethods } from "@/lib/supabase/tables/payment-methods-table";
import AdminAddPaymentMethodDialog from "@/components/layouts/payment-methods-table/admin-add-payment-method-dialog";
import AdminEditPaymentMethodDialog from "@/components/layouts/payment-methods-table/admin-edit-payment-method-dialog";
import AdminDeletePaymentMethodDialog from "@/components/layouts/payment-methods-table/admin-delete-payment-method-dialog";

type SortField = "id" | "name" | "created_at";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

export default function AdminPaymentMethodsTable() {
  // States
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[]>([]);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [paymentMethodUpdate, setPaymentMethodUpdate] = useState<PaymentMethodRow | undefined>(undefined);
  const [paymentMethodDelete, setPaymentMethodDelete] = useState<PaymentMethodRow | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "id", direction: "asc" });

  // Derived / filtered rows
  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = paymentMethods.filter((item) => {
      return (
        query === "" ||
        item.name.toLowerCase().includes(query) ||
        String(item.id).includes(query)
      );
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sort.field === "id") {
        cmp = a.id - b.id;
      } else if (sort.field === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sort.field === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });

    return result;
  }, [paymentMethods, searchQuery, sort]);

  function handleSortToggle(field: SortField) {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "asc" };
    });
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sort.field !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
    return sort.direction === "asc"
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />;
  }

  // Handlers
  function onRowAdd(row: PaymentMethodRow | null) {
    if (!row) return;
    setPaymentMethods((prev) => [row, ...prev]);
  }

  function onRowUpdate(row: PaymentMethodRow | null) {
    setPaymentMethodUpdate(undefined);
    if (!row) return;
    setPaymentMethods((prev) => prev.map((e) => (e.id === row.id ? row : e)));
  }

  function onRowDelete(row: PaymentMethodRow | null) {
    setPaymentMethodDelete(undefined);
    if (!row) return;
    setPaymentMethods((prev) => prev.filter((e) => e.id !== row.id));
  }

  // Use effects
  useEffect(() => {
    async function fetchPaymentMethods() {
      setLoading(true);

      try {
        const data = await getAllPaymentMethods();
        setPaymentMethods(data ?? []);
      } catch (error) {
        toast.error("Failed to Fetch Payment Methods", {
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentMethods();
  }, []);

  return (
    <div className="space-y-4 bg-card border border-border p-5 rounded-xl">
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
      <Lightbox
        open={!!imagePreview}
        close={() => setImagePreview(undefined)}
        slides={[{ src: imagePreview ?? "" }]}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Payment Methods</h2>
          {!loading && (
            <Badge variant="secondary" className="text-xs">
              {filteredRows.length} / {paymentMethods.length}
            </Badge>
          )}
        </div>
        <AdminAddPaymentMethodDialog onRowAdd={onRowAdd} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="payment-methods-search"
          type="search"
          placeholder="Search by name or ID…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <button
                  onClick={() => handleSortToggle("id")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Method ID {SortIcon({ field: "id" })}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("created_at")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Created At {SortIcon({ field: "created_at" })}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSortToggle("name")}
                  className="flex items-center text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  Name {SortIcon({ field: "name" })}
                </button>
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide">QR Code</TableHead>
              <TableHead className="text-end text-xs font-medium uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading &&
              [1, 2, 3, 4, 5].map((item) => (
                <TableRow key={`payment-methods-table-skeleton-${item}`}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="flex justify-end"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}

            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Wallet className="h-8 w-8 opacity-30" />
                    <p className="text-sm font-medium">
                      {paymentMethods.length === 0
                        ? "No payment methods found. Add your first payment method to get started."
                        : "No payment methods match your search."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredRows.map((item) => {
                const formattedCreatedAt = new Date(item.created_at).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                });

                const hasQrCode = Boolean(item.qr_code_image);

                return (
                  <TableRow key={`payment-methods-item-${item.id}`} className="group">
                    <TableCell className="font-mono text-sm text-muted-foreground">#{item.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formattedCreatedAt}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {hasQrCode ? (
                        <Badge variant="secondary">Available</Badge>
                      ) : (
                        <Badge variant="outline">None</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-60 group-hover:opacity-100 transition-opacity"
                              id={`payment-method-actions-${item.id}`}
                            >
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Row Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              disabled={!hasQrCode}
                              onClick={() => setImagePreview(item.qr_code_image_url)}
                            >
                              View QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPaymentMethodUpdate(item)}>
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setPaymentMethodDelete(item)}
                            >
                              Delete
                            </DropdownMenuItem>
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

      {/* Footer count */}
      {!loading && paymentMethods.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filteredRows.length} of {paymentMethods.length}{" "}
          payment method{paymentMethods.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
