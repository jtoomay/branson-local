import { PageSkeleton } from "@/components/admin/shell";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading">
      <PageSkeleton />
    </div>
  );
}
