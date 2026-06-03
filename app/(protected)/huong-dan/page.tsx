import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileDown, FolderKanban, Settings2, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "1. Cài đặt hồ sơ",
    description: "Nhập họ tên, đơn giá theo giờ mặc định và tiền tệ. Đây là mức dự phòng khi khách hàng hoặc dự án chưa có đơn giá riêng.",
    href: "/settings",
    action: "Mở cài đặt",
    icon: Settings2
  },
  {
    title: "2. Tạo khách hàng",
    description: "Thêm thông tin liên hệ, ghi chú, tiền tệ và đơn giá mặc định cho từng khách hàng.",
    href: "/clients",
    action: "Tạo khách hàng",
    icon: UsersRound
  },
  {
    title: "3. Tạo dự án",
    description: "Chọn khách hàng, đặt trạng thái dự án và khai báo đơn giá riêng nếu dự án có mức tính phí khác.",
    href: "/projects",
    action: "Tạo dự án",
    icon: FolderKanban
  },
  {
    title: "4. Ghi thời gian",
    description: "Dùng bộ đếm khi đang làm việc hoặc nhập thủ công khi cần bổ sung công việc đã hoàn thành.",
    href: "/time",
    action: "Ghi thời gian",
    icon: Clock3
  },
  {
    title: "5. Xuất báo cáo",
    description: "Lọc theo khoảng ngày, khách hàng hoặc dự án, kiểm tra tổng giờ/tổng tiền rồi xuất CSV để gửi cho khách hàng.",
    href: "/reports",
    action: "Xem báo cáo",
    icon: FileDown
  }
];

const rules = [
  "Bản ghi thời gian cần có dự án và mô tả công việc.",
  "Nếu dự án có đơn giá riêng, hệ thống dùng đơn giá của dự án.",
  "Nếu dự án chưa có đơn giá, hệ thống dùng đơn giá mặc định của khách hàng.",
  "Nếu khách hàng cũng chưa có đơn giá, hệ thống dùng đơn giá mặc định trong hồ sơ.",
  "Bản ghi thời gian không tính phí luôn có thành tiền bằng 0.",
  "Thời lượng và đơn giá theo giờ không được là số âm."
];

export default function GuidePage() {
  return (
    <>
      <PageHeader title="Hướng dẫn sử dụng" description="Quy trình cơ bản để thiết lập WorkLog, ghi giờ làm và xuất báo cáo." />
      <section className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="leading-snug">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={step.href}>
                      {step.action}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Quy tắc tính tiền</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule} className="flex gap-3 text-sm leading-6">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Luồng làm việc khuyến nghị</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                Bắt đầu từ hồ sơ và khách hàng trước, sau đó tạo dự án. Khi làm việc hằng ngày, vào trang Thời gian,
                chọn dự án, nhập mô tả rõ ràng rồi bấm Bắt đầu. Khi xong việc, bấm Dừng để lưu bản ghi thời gian.
              </p>
              <p>
                Cuối ngày hoặc cuối tuần, mở Tổng quan để kiểm tra giờ làm. Khi cần gửi cho khách hàng, vào Báo cáo,
                chọn khoảng ngày phù hợp và xuất CSV.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
