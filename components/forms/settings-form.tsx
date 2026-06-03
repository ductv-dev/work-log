"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

export function SettingsForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [defaultRate, setDefaultRate] = useState(String(profile?.default_hourly_rate || 0));
  const [currency, setCurrency] = useState(profile?.currency || "VND");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rate = Number(defaultRate || 0);

    if (rate < 0) {
      toast({ title: "Đơn giá theo giờ không được âm", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName.trim() || null,
      default_hourly_rate: rate,
      currency
    });
    setLoading(false);

    if (error) {
      toast({ title: "Không thể lưu cài đặt", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Đã lưu cài đặt" });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Hồ sơ</CardTitle>
        <CardDescription>Mặc định này được dùng khi khách hàng và dự án chưa có đơn giá riêng.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="full-name">Họ tên</Label>
            <Input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="default-rate">Đơn giá theo giờ mặc định</Label>
              <Input id="default-rate" type="number" min="0" step="0.01" value={defaultRate} onChange={(event) => setDefaultRate(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Tiền tệ</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">VND</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
