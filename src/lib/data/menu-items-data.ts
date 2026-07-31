// Types
export type MenuItem = {
  value: number | string;
  label: string;
};

// Menu items
export const paymentMethodMenuItems: MenuItem[] = [
  { value: "GCash", label: "GCash" },
  { value: "GoTyme", label: "GoTyme" },
  { value: "Bank Transfer", label: "Bank Transfer" },
];

export const bookingStatusMenuItems: MenuItem[] = [
  { value: 1, label: "Completed" },
  { value: 2, label: "Change Unit" },
  { value: 3, label: "Reserved" },
  { value: 4, label: "Rescheduled" },
  { value: 5, label: "Cancelled" },
];

export const paymentStatusMenuItems: MenuItem[] = [
  { value: 1, label: "Paid" },
  { value: 2, label: "Partially Paid" },
  { value: 3, label: "Pending" },
];