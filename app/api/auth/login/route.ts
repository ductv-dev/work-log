import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/types/database";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectedFrom = String(formData.get("redirectedFrom") || "");
  const redirectTo = redirectedFrom.startsWith("/") ? redirectedFrom : "/dashboard";

  // Use request-based cookies so Set-Cookie lands on the redirect response
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

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", error.message);
    if (redirectedFrom) loginUrl.searchParams.set("redirectedFrom", redirectedFrom);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
  cookiesToForward.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
