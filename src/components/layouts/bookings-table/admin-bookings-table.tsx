import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBookingsTable() {
  return (
    <div className="space-y-3 bg-card border border-border p-4 rounded-xl">

      <Table>
        <TableCaption>A list of your Bookings</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Rental ID</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-end">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/*{[1, 2, 3, 4, 5].map(item => (*/}
          {/*  <TableRow key={`vehicle-colors-table-skeleton-${item}`}>*/}
          {/*    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>*/}
          {/*    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>*/}
          {/*    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>*/}
          {/*    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>*/}
          {/*    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>*/}
          {/*    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>*/}
          {/*    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>*/}
          {/*  </TableRow>*/}
          {/*))}*/}
        </TableBody>
      </Table>

    </div>
  );
}