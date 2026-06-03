"use server";

import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const redirectedFrom = String(formData.get("redirectedFrom") || "");
  return { redirectTo: redirectedFrom.startsWith("/") ? redirectedFrom : "/dashboard" };
}

export async function registerAction(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "");

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/auth/callback`
    }
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return { message: "Kiểm tra hộp thư để xác nhận email trước khi đăng nhập." };
  }

  return { redirectTo: "/dashboard" };
}
