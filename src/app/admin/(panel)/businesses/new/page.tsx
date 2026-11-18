import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin/auth";
import { getCategories } from "@/lib/admin/queries";
import { BusinessForm } from "@/components/admin/business-form";

export const metadata: Metadata = { title: "New business" };

export default async function NewBusinessPage() {
  await requireAdminPage();
  const categories = await getCategories();
  return <BusinessForm categories={categories.map(({ id, name }) => ({ id, name }))} />;
}
