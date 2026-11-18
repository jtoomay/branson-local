# Future work

Each file in this folder is one self-contained feature or fix that is **not** in the first build.
Pick one up, implement it, then delete the file.

| File | Priority | Summary |
|---|---|---|
| [01-ad-placements.md](01-ad-placements.md) | High | Manage paid ad slots (front-page header/banner, category banners) from the admin |
| [02-contact-notifications.md](02-contact-notifications.md) | High | Email the owner when a contact/advertise form is submitted |
| [03-spam-protection.md](03-spam-protection.md) | High | Add Cloudflare Turnstile (old site used reCAPTCHA) to the contact form |
| [04-verify-legacy-data.md](04-verify-legacy-data.md) | High | Confirm broken/mismatched links found on the old site with the business owners |
| [05-transcribe-ad-images.md](05-transcribe-ad-images.md) | Medium | Transcribe text baked into the old sample-ad banner images |
| [06-production-deploy.md](06-production-deploy.md) | High | Move from local Supabase to Supabase Cloud + Vercel/Netlify, point the domain |
| [07-editable-site-content.md](07-editable-site-content.md) | Medium | Make page copy, ad prices and site settings editable in the admin |
| [08-online-ad-payments.md](08-online-ad-payments.md) | Medium | Let businesses buy an ad package online (Stripe) |
| [09-business-self-service.md](09-business-self-service.md) | Low | Let owners claim and update their own listing |
| [10-map-view.md](10-map-view.md) | Low | Interactive map of all businesses (needs geocoding) |
| [11-admin-users.md](11-admin-users.md) | Low | Invite/remove admins from inside the admin portal |
| [12-listing-expiry.md](12-listing-expiry.md) | Medium | Track paid-until dates (ads are sold per year) and auto-unpublish/remind |
