"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";

export interface AuthActionResult {
  error: string | null;
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<AuthActionResult> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
