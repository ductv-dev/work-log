import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/types/database";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "");

  let cookiesToForward: CookieToSet[] = [];

  const supabase = createServerClient<Database, "public", Database["public"]>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToForward = cookiesToSet;
        }
      }
    }
  );

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin}/auth/callback`
    }
  });

  if (error) {
    const url = new URL("/register", request.url);
    url.searchParams.set("error", error.message);
    return NextResponse.redirect(url, { status: 303 });
  }

  if (!data.session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("message", "Kiểm tra hộp thư để xác nhận email trước khi đăng nhập.");
    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
  cookiesToForward.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
