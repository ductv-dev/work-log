"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const isLogin = mode === "login";

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const fullName = String(formData.get("full_name") || "");

    const result = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/dashboard`
          }
        });

    setLoading(false);

    if (result.error) {
      toast({ title: "Đăng nhập/đăng ký thất bại", description: result.error.message, variant: "destructive" });
      return;
    }

    toast({ title: isLogin ? "Chào mừng bạn quay lại" : "Đã tạo tài khoản" });
    router.push(searchParams.get("redirectedFrom") || "/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="floaty mb-3 h-20 w-20 overflow-hidden rounded-md mint-gradient shadow-md">
          <Image src="/images/worklog-mascot.png" alt="Mascot WorkLog" width={80} height={80} className="h-full w-full object-cover" priority />
        </div>
        <CardTitle>{isLogin ? "Đăng nhập WorkLog" : "Tạo tài khoản WorkLog"}</CardTitle>
        <CardDescription>{isLogin ? "Ghi thời gian, tính phí chính xác và xuất báo cáo gọn gàng." : "Bắt đầu bằng email và mật khẩu."}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {!isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="full_name">Họ tên</Label>
              <Input id="full_name" name="full_name" autoComplete="name" />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} required minLength={6} />
          </div>
          <Button className="w-full" disabled={loading}>
            {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <Link className="font-medium text-primary hover:underline" href={isLogin ? "/register" : "/login"}>
            {isLogin ? "Đăng ký" : "Đăng nhập"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
