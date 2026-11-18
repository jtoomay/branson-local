// Hand-written row types mirroring supabase/migrations/20261117000000_init.sql.
// Regenerate with: supabase gen types typescript --local > src/lib/database.types.gen.ts

export type Category = {
  id: string;
  slug: string;
  name: string;
  headline: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ExtraLink = { label: string; url: string };

export type Business = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  maps_url: string | null;
  logo_url: string | null;
  source_image_url: string | null;
  extra_links: ExtraLink[];
  featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BusinessWithCategories = Business & { categories: Pick<Category, "id" | "slug" | "name">[] };

export type ContactSubmission = {
  id: string;
  kind: "contact" | "advertise";
  name: string;
  email: string;
  phone: string | null;
  business: string | null;
  message: string;
  handled: boolean;
  created_at: string;
};
