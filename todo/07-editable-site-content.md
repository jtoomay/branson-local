# Editable site content

**First build:** page copy, ad prices, phone number, social links and ticket links are kept in `src/content/site.ts`, and a developer has to change them.

**To do:** add a `site_settings` table holding key and JSON value, with RLS where the public can read and only admins can write. Add an admin "Site settings" page with forms for:
- contact phone
- socials
- Google review URL
- i.travel ticket URLs
- the advertise price list
- home hero copy

Read these values at render time and revalidate on save.
