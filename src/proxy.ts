import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/supabase-proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match admin routes only. Public pages do not need auth session refresh.
     * Excludes static assets under those paths.
     */
    "/admin",
    "/admin/:path*",
  ],
};
