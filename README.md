# WorkLog

WorkLog là MVP web app dành cho freelancer hoặc team nhỏ để ghi thời gian làm việc, mô tả việc đã làm, tính tiền theo giờ và xuất báo cáo CSV.

## Công nghệ

- Next.js App Router
- TypeScript
- Tailwind CSS
- Component theo phong cách shadcn/ui
- Supabase Auth, Supabase Postgres và Row Level Security
- Sẵn sàng deploy lên Vercel

## Cài đặt local

1. Cài package:

```bash
npm install
```

2. Tạo project Supabase.

3. Copy `.env.example` thành `.env.local` và điền:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Lấy Project URL và anon public key trong Supabase Project Settings. Không đưa `service_role` key vào frontend.

4. Chạy SQL migration.

Mở Supabase SQL Editor và chạy file:

```text
supabase/migrations/001_initial_schema.sql
```

Migration sẽ tạo các bảng `profiles`, `clients`, `projects`, `time_entries`, trigger cập nhật thời gian, trigger tạo hồ sơ sau khi đăng ký, index và RLS policy để mỗi user chỉ thấy dữ liệu của chính mình.

5. Chạy app local:

```bash
npm run dev
```

Mở `http://localhost:3000`.

## Route chính

- `/login`
- `/register`
- `/dashboard`
- `/clients`
- `/projects`
- `/time`
- `/reports`
- `/huong-dan`
- `/settings`

Các route cần đăng nhập sẽ tự chuyển về `/login` nếu chưa có Supabase session.

## Deploy lên Vercel

1. Push project lên Git repository.
2. Import repository vào Vercel.
3. Thêm các biến môi trường trong Vercel Project Settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

4. Deploy.

Sau khi deploy, thêm URL Vercel vào Supabase:

- Authentication > URL Configuration > Site URL: `https://your-app.vercel.app`
- Authentication > URL Configuration > Redirect URLs: `https://your-app.vercel.app/**`

Khi chạy local, thêm cả `http://localhost:3000/**`.

## Ghi chú

- Tính tiền ưu tiên đơn giá dự án, sau đó đến đơn giá khách hàng, cuối cùng là đơn giá mặc định trong hồ sơ.
- Bản ghi không tính phí luôn lưu `amount = 0`.
- Xuất CSV tại `/reports`.
