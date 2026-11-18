import Link from "next/link";
import { btn, Card, EmptyState } from "@/components/admin/ui";
import { IconStore } from "@/components/admin/icons";

export default function BusinessNotFound() {
  return (
    <Card>
      <EmptyState icon={<IconStore />} title="Business not found">
        <p>It may have been deleted, or the link is wrong.</p>
        <Link href="/admin/businesses" className={`${btn.secondary} mt-4`}>
          Back to businesses
        </Link>
      </EmptyState>
    </Card>
  );
}
