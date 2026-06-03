"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
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

  function getRedirectPath() {
    const redirectedFrom = searchParams.get("redirectedFrom");
    return redirectedFrom?.startsWith("/") ? redirectedFrom : "/dashboard";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
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

    if (result.error) {
      setLoading(false);
      toast({ title: "Đăng nhập/đăng ký thất bại", description: result.error.message, variant: "destructive" });
      return;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      toast({
        title: isLogin ? "Chưa tạo được phiên đăng nhập" : "Đã tạo tài khoản",
        description: isLogin
          ? "Vui lòng thử đăng nhập lại sau vài giây."
          : "Nếu Supabase bật xác nhận email, hãy kiểm tra hộp thư trước khi đăng nhập."
      });
      if (!isLogin) router.replace("/login");
      return;
    }

    toast({ title: isLogin ? "Chào mừng bạn quay lại" : "Đã tạo tài khoản" });
    router.replace(getRedirectPath());
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button className="w-full" disabled={loading} type="submit">
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
