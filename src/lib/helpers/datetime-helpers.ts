export function getDaysBetween(date1: Date, date2: Date) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffInMs = Math.abs(d2.getTime() - d1.getTime());
  const msInDay = 1000 * 60 * 60 * 24;

  return Math.floor(diffInMs / msInDay);
}

export function getCurrentTimeString(date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};