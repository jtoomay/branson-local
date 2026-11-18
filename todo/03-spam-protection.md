# Spam protection on the contact form

**Old site:** Wufoo with reCAPTCHA Enterprise + a honeypot field.
**First build:** honeypot field + server-side validation (zod) + basic length limits.

**To do:** add Cloudflare Turnstile (free, privacy-friendly). Verify the token in the server action before inserting. Optionally rate-limit by IP.
