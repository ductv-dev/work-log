import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { PWARegister } from "@/components/pwa-register";
import { TanStackQueryProvider } from "@/lib/query/query-provider";

export const metadata: Metadata = {
  title: "WorkLog",
  description: "Ghi thời gian, tính tiền theo giờ và xuất báo cáo cho freelancer hoặc team nhỏ.",
  manifest: "/manifest.webmanifest",
  applicationName: "WorkLog",
  appleWebApp: {
    capable: true,
    title: "WorkLog",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
  }
};

export const viewport = {
  themeColor: "#6366f1",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <TanStackQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <PWARegister />
            {children}
            <Toaster />
          </ThemeProvider>
        </TanStackQueryProvider>
      </body>
    </html>
  );
}
