import { ActualFileObject } from "filepond";

export function generateFileName(file: ActualFileObject) {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  const baseName = file.name
    .substring(0, file.name.lastIndexOf('.'))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  const uniqueId = crypto.randomUUID();

  return `${uniqueId}-${baseName}.${fileExtension}`;
}