import { createBrowserClient } from "@supabase/ssr";

import { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/**
 * Browser Supabase client backed by cookie sessions (@supabase/ssr).
 * Used by client components for data/storage operations that share the SSR auth session.
 */
export const supabaseClient = createBrowserClient<Database>(
  supabaseUrl,
  supabaseKey
);
