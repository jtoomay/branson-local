# Branson Local Businesses

A rebuild of [bransonlocalbusinesses.com](https://www.bransonlocalbusinesses.com) using **Next.js 16** (App Router) and a **local Supabase** backend (Postgres, Auth, Storage), with an admin portal for managing the directory.

---

## 1. Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20 or newer (24 recommended) | `node -v` |
| Docker Desktop | running | `docker ps` |
| Supabase CLI | 2.x or newer | `supabase --version` (install: `brew install supabase/tap/supabase`) |

## 2. First-time setup

```bash
cd branson-local
npm install

# 1. Start local Supabase (first run downloads Docker images, takes a few minutes)
npm run db:start

# 2. Create .env.local from the values the command prints
cp .env.example .env.local
#    NEXT_PUBLIC_SUPABASE_URL             -> "API_URL"         (http://127.0.0.1:55421)
#    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY -> "PUBLISHABLE_KEY"
#    SUPABASE_SECRET_KEY                  -> "SECRET_KEY"
#    ADMIN_EMAIL / ADMIN_PASSWORD         -> the admin login you want
#    (Print them again any time with: supabase status)

# 3. Build the seed from the scraped data, reset the DB (migrations + seed), create the admin user
npm run setup

# 4. Run the site
npm run dev
```

| What | URL |
|---|---|
| Website | http://localhost:3000 |
| Admin portal | http://localhost:3000/admin (log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`) |
| Supabase Studio (database UI) | http://127.0.0.1:55423 |
| Mailpit (local test emails) | http://127.0.0.1:55424 |

> **Ports:** this project uses ports **5542x** instead of Supabase's default 5432x, so it can run next to other local Supabase projects. You can change them in `supabase/config.toml`.

## 3. Daily use

```bash
npm run db:start   # start Supabase (data persists between restarts)
npm run dev        # start Next.js
npm run db:stop    # stop Supabase when you're done
```

## 4. Managing businesses (admin portal)

1. Go to **/admin** and sign in.
2. **Businesses**: search, filter, add, edit, delete, publish/unpublish, mark as featured (shown on the home page), upload logos, and assign one or more categories.
3. **Categories**: add, rename, reorder or delete categories, and edit each category's SEO title and description.
4. **Inbox**: read contact and advertising requests sent from the website's contact form.

Changes appear on the public site immediately, because pages are revalidated on save.

**Add another admin:** `npm run admin:create -- someone@email.com 'StrongPassword'`. Public sign-up is turned off on purpose.

## 5. Data

- `data/scraped/`: everything scraped from the old site (`businesses.json`, `pages.json`, `features.json`).
- `data/categories.json`: category names and SEO copy.
- `public/legacy/`: logos and photos downloaded from the old site.
- `supabase/migrations/`: database schema and row-level security policies.
- `supabase/seed.sql`: **generated** by `npm run seed:build`. Don't edit it by hand.

> ⚠️ `npm run db:reset` / `npm run setup` **wipes the local database** and reloads the seed data. Any changes made in the admin are lost. Back up first with `supabase db dump --local --data-only > backup.sql`.

## 6. SEO

- Every page has its own title, description, canonical URL and Open Graph tags.
- `/sitemap.xml` and `/robots.txt` are generated automatically.
- Structured data (JSON-LD) on every page: Organization/WebSite, ItemList and breadcrumbs on category pages, LocalBusiness on business pages.
- **Old URLs redirect permanently (301) to the new routes**, e.g. `/hotels.htm` → `/hotels` (see `next.config.ts`), so existing Google rankings carry over.
- Google Analytics 4 (`G-HDH80H2XBJ`) is kept so traffic history continues.

## 7. Hosted Supabase (production database)

The hosted project lives in the **branson-tourist** org. The same migration and seed used locally create the schema, security rules, `logos` bucket and all 151 businesses.

```bash
# 1. Link this folder to the hosted project (asks for the database password you set when creating it)
npm run remote:link -- <project-ref>        # ref = the xxxx in https://xxxx.supabase.co

# 2. Create the tables, RLS policies, storage bucket, and load the seed data (run ONCE)
npm run remote:push

# 3. Fill in the hosted keys
cp .env.production.example .env.production.local   # then paste URL + keys from the dashboard

# 4. Create your admin login on the hosted project
npm run remote:admin
```

Then, in the Supabase dashboard:
- **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up" (the admin is created by script).
- **Authentication → URL Configuration**: set Site URL to your live domain.

On your host (Vercel/Netlify), set the same variables from `.env.production.local` as environment variables. `SUPABASE_SECRET_KEY` must stay server-only.

> Later schema changes: add a new file in `supabase/migrations/` and run `supabase db push --linked`. Never run `db reset --linked`, which wipes production.

## 8. Going live

See [`todo/06-production-deploy.md`](todo/06-production-deploy.md). Other planned features are in [`todo/`](todo/README.md).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` / `start` | Production build and serve |
| `npm run typecheck` / `lint` | TypeScript and ESLint |
| `npm run db:start` / `db:stop` / `db:reset` | Local Supabase |
| `npm run seed:build` | Regenerate `supabase/seed.sql` from `data/` |
| `npm run admin:create` | Create or promote an admin user |
| `npm run setup` | `seed:build` + `db:reset` + `admin:create` |
