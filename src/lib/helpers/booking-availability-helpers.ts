import { BookingRow } from "@/types/models.types";
import { format } from "date-fns";

/**
 * Parses a date string or Date object combined with a time string (e.g. "09:00" or "14:30:00").
 */
export function parseBookingDateTime(dateVal: string | Date, timeStr?: string): Date | null {
  if (!dateVal) return null;
  const d = typeof dateVal === "string" ? new Date(dateVal) : new Date(dateVal.getTime());
  if (isNaN(d.getTime())) return null;

  if (timeStr && timeStr.trim().length > 0) {
    const parts = timeStr.trim().split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    const seconds = parts.length > 2 ? parseInt(parts[2], 10) : 0;

    if (!isNaN(hours)) d.setHours(hours);
    if (!isNaN(minutes)) d.setMinutes(minutes);
    if (!isNaN(seconds)) d.setSeconds(seconds);
    else d.setSeconds(0);
    d.setMilliseconds(0);
  } else {
    d.setHours(0, 0, 0, 0);
  }

  return d;
}

/**
 * Filters active (non-cancelled) bookings for a specific vehicle.
 */
export function getVehicleActiveBookings(
  allBookings: BookingRow[],
  vehicleId: number,
  excludeBookingId?: number
): BookingRow[] {
  return allBookings.filter((b) => {
    if (b.vehicle_id !== vehicleId) return false;
    // Status 5 = Cancelled
    if (b.booking_status === 5) return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    return true;
  });
}

/**
 * Checks if a specific date (day interval 00:00:00 to 23:59:59) overlaps with any active vehicle booking.
 */
export function isDateBookedForVehicle(date: Date, activeVehicleBookings: BookingRow[]): boolean {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return activeVehicleBookings.some((b) => {
    const bStart = parseBookingDateTime(b.rental_date, b.time_of_rental);
    const bEnd = parseBookingDateTime(b.return_date, b.time_of_return);

    if (!bStart || !bEnd) return false;
    return bStart < dayEnd && bEnd > dayStart;
  });
}

export type ConflictCheckResult = {
  hasConflict: boolean;
  conflictingBooking?: BookingRow;
  message?: string;
};

/**
 * Validates whether a proposed rental range overlaps with any existing booking for the vehicle.
 */
export function checkBookingConflict(
  vehicleId: number,
  rentalDate: Date,
  rentalTime: string,
  returnDate: Date,
  returnTime: string,
  allBookings: BookingRow[],
  excludeBookingId?: number
): ConflictCheckResult {
  const newStart = parseBookingDateTime(rentalDate, rentalTime);
  const newEnd = parseBookingDateTime(returnDate, returnTime);

  if (!newStart || !newEnd) {
    return {
      hasConflict: true,
      message: "Invalid rental or return date/time.",
    };
  }

  if (newEnd <= newStart) {
    return {
      hasConflict: true,
      message: "Return date/time must be after rental date/time.",
    };
  }

  const activeBookings = getVehicleActiveBookings(allBookings, vehicleId, excludeBookingId);

  for (const b of activeBookings) {
    const bStart = parseBookingDateTime(b.rental_date, b.time_of_rental);
    const bEnd = parseBookingDateTime(b.return_date, b.time_of_return);

    if (!bStart || !bEnd) continue;

    // Overlap condition: start1 < end2 AND end1 > start2
    if (newStart < bEnd && newEnd > bStart) {
      const formattedStart = format(bStart, "MMM d, yyyy h:mm a");
      const formattedEnd = format(bEnd, "MMM d, yyyy h:mm a");
      return {
        hasConflict: true,
        conflictingBooking: b,
        message: `This vehicle is already reserved from ${formattedStart} to ${formattedEnd}.`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Returns formatted date-time string representations of active bookings for display.
 */
export function getFormattedBookedSchedules(activeVehicleBookings: BookingRow[]): {
  id: number;
  displayText: string;
  from: Date;
  to: Date;
}[] {
  return activeVehicleBookings
    .map((b) => {
      const bStart = parseBookingDateTime(b.rental_date, b.time_of_rental);
      const bEnd = parseBookingDateTime(b.return_date, b.time_of_return);
      if (!bStart || !bEnd) return null;

      return {
        id: b.id,
        displayText: `${format(bStart, "MMM d, yyyy h:mm a")} — ${format(bEnd, "MMM d, yyyy h:mm a")}`,
        from: bStart,
        to: bEnd,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.from.getTime() - b.from.getTime());
}
