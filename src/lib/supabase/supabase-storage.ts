import { supabaseClient } from "@/lib/supabase/supabase-client";
import { generateFileName } from "@/lib/generators/generators";
import { ActualFileObject } from "filepond";

// Functions
export async function uploadToBucket(bucket: string, file: ActualFileObject): Promise<string> {
  const newFileName = generateFileName(file);

  const { error } = await supabaseClient
    .storage
    .from(bucket)
    .upload(newFileName, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) throw error;

  return newFileName;
}

export async function deleteFromBucket(bucket: string, filepaths: string[]): Promise<void> {
  const { error } = await supabaseClient
    .storage
    .from(bucket)
    .remove(filepaths)

  if (error) throw error;
}

export async function getSignedUrl(bucket: string, filepath: string): Promise<string> {
  const { data, error } = await supabaseClient
    .storage
    .from(bucket)
    .createSignedUrl(filepath, 3600);

  if (error) throw error;

  return data.signedUrl;
}