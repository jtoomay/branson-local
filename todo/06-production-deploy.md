# Production deploy

1. Create a Supabase Cloud project. Run `supabase link --project-ref <ref>`, then `supabase db push`.
2. Seed production: run the generated `supabase/seed.sql` once (SQL editor or `psql`).
3. Upload `/public/legacy` logos to Storage, or keep them as static files.
4. Create the admin: run `npm run admin:create` with the production URL and secret key in the environment.
5. Deploy Next.js to Vercel or Netlify. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and `NEXT_PUBLIC_SITE_URL=https://www.bransonlocalbusinesses.com`.
6. Set the Supabase Auth Site URL and redirect URLs to the production domain.
7. Point DNS at the new host. The 301 redirects from the old `.htm` URLs are already in `next.config.ts`.
8. Submit `/sitemap.xml` in Google Search Console. Keep GA4 `G-HDH80H2XBJ` so traffic history continues.
