// Types
export type MenuItem = {
  value: number | string;
  label: string;
};

// Menu items
export const bookingStatusMenuItems: MenuItem[] = [
  { value: 1, label: "Completed" },
  { value: 3, label: "Reserved" },
  { value: 6, label: "On-Going" },

  { value: 2, label: "Change Unit" },
  { value: 4, label: "Rescheduled" },

  { value: 5, label: "Cancelled" },
];

export const paymentStatusMenuItems: MenuItem[] = [
  { value: 1, label: "Paid" },
  { value: 2, label: "Partially Paid" },
  { value: 3, label: "Pending" },
];