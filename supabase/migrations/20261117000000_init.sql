-- Branson Local Businesses — initial schema
create extension if not exists "pgcrypto";

-- ───────────────────────── Tables ─────────────────────────
create table public.categories (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name            text not null,
  headline        text,
  description     text,
  seo_title       text,
  seo_description text,
  sort_order      int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.businesses (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name             text not null,
  tagline          text,
  description      text,
  address          text,
  city             text default 'Branson',
  state            text default 'MO',
  zip              text,
  phone            text,
  email            text,
  website          text,
  facebook         text,
  instagram        text,
  maps_url         text,
  logo_url         text,            -- /legacy/... or Supabase Storage public URL
  source_image_url text,            -- original image on the legacy site
  extra_links      jsonb not null default '[]'::jsonb,  -- [{label,url}]
  featured         boolean not null default false,
  is_published     boolean not null default true,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.business_categories (
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (business_id, category_id)
);
create index on public.business_categories (category_id);

create table public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null default 'contact' check (kind in ('contact','advertise')),
  name       text not null,
  email      text not null,
  phone      text,
  business   text,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Helpers ─────────────────────────
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create trigger businesses_touch before update on public.businesses
  for each row execute function public.touch_updated_at();
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();

-- ───────────────────────── RLS ─────────────────────────
alter table public.categories          enable row level security;
alter table public.businesses          enable row level security;
alter table public.business_categories enable row level security;
alter table public.admins              enable row level security;
alter table public.contact_submissions enable row level security;

-- Public read
create policy "categories public read" on public.categories for select using (true);
create policy "businesses public read" on public.businesses for select
  using (is_published or public.is_admin());
create policy "business_categories public read" on public.business_categories for select using (true);

-- Admin full CRUD
create policy "categories admin write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());
create policy "businesses admin write" on public.businesses for all
  using (public.is_admin()) with check (public.is_admin());
create policy "business_categories admin write" on public.business_categories for all
  using (public.is_admin()) with check (public.is_admin());
create policy "admins self read" on public.admins for select using (user_id = auth.uid());

-- Contact form: anyone may submit, only admins may read/update/delete
create policy "contact insert" on public.contact_submissions for insert with check (true);
create policy "contact admin read" on public.contact_submissions for select using (public.is_admin());
create policy "contact admin update" on public.contact_submissions for update
  using (public.is_admin()) with check (public.is_admin());
create policy "contact admin delete" on public.contact_submissions for delete using (public.is_admin());

-- ───────────────────────── Grants ─────────────────────────
-- New tables are not auto-exposed to the Data API; grant explicitly. RLS still governs rows.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories, public.businesses, public.business_categories to anon, authenticated;
grant insert, update, delete on public.categories, public.businesses, public.business_categories to authenticated;
grant select on public.admins to authenticated;
grant insert on public.contact_submissions to anon, authenticated;
grant select, update, delete on public.contact_submissions to authenticated;
grant all on all tables in schema public to service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ───────────────────────── Storage ─────────────────────────
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
  on conflict (id) do nothing;

create policy "logos public read" on storage.objects for select using (bucket_id = 'logos');
create policy "logos admin insert" on storage.objects for insert
  with check (bucket_id = 'logos' and public.is_admin());
create policy "logos admin update" on storage.objects for update
  using (bucket_id = 'logos' and public.is_admin());
create policy "logos admin delete" on storage.objects for delete
  using (bucket_id = 'logos' and public.is_admin());
