export function getDaysBetween(date1: Date, date2: Date) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffInMs = Math.abs(d2.getTime() - d1.getTime());
  const msInDay = 1000 * 60 * 60 * 24;

  return Math.floor(diffInMs / msInDay);
}