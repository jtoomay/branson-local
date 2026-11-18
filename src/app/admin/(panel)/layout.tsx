import { Suspense } from "react";
import { AdminShell, ShellSkeleton } from "@/components/admin/shell";

// Every admin view is per-session; skip instant-navigation validation for this segment.
export const instant = false;

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  // The session read happens inside the boundary (required with Cache Components).
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
