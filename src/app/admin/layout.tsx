import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/toast";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Branson Local" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** Admin root: owns all admin chrome (the root layout only provides html/body/fonts). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex-1 bg-zinc-100/60 font-sans text-zinc-900 antialiased [color-scheme:light] selection:bg-[#155D6B]/15">
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
