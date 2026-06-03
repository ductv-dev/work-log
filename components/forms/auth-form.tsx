"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    const redirectedFrom = searchParams.get("redirectedFrom") || "";
    if (redirectedFrom.startsWith("/")) {
      formData.set("redirectedFrom", redirectedFrom);
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(endpoint, { method: "POST", body: formData });
    const finalUrl = new URL(response.url);

    const error = finalUrl.searchParams.get("error");
    if (error) {
      setLoading(false);
      toast({ title: isLogin ? "Đăng nhập thất bại" : "Đăng ký thất bại", description: error, variant: "destructive" });
      return;
    }

    const message = finalUrl.searchParams.get("message");
    if (message) {
      setLoading(false);
      toast({ title: "Đã tạo tài khoản", description: message });
      return;
    }

    window.location.href = finalUrl.pathname || "/dashboard";
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
