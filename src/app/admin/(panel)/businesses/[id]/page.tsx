import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin/auth";
import { getBusinessForEdit, getCategories } from "@/lib/admin/queries";
import { BusinessForm } from "@/components/admin/business-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const found = await getBusinessForEdit(id).catch(() => null);
  return { title: found ? `Edit ${found.business.name}` : "Edit business" };
}

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [found, categories] = await Promise.all([getBusinessForEdit(id), getCategories()]);
  if (!found) notFound();

  return (
    <BusinessForm
      // Remount when switching between businesses so local form state never leaks across records.
      key={found.business.id}
      business={found.business}
      categoryIds={found.categoryIds}
      categories={categories.map(({ id, name }) => ({ id, name }))}
    />
  );
}
