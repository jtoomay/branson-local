import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin/auth";
import { getCategories, getCategoryCounts } from "@/lib/admin/queries";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdminPage();
  const categories = await getCategories();
  const counts = await getCategoryCounts(categories.map((c) => c.id));
  return <CategoryManager categories={categories.map((c) => ({ ...c, count: counts[c.id] ?? 0 }))} />;
}
