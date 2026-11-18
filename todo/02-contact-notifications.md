# Email notification on form submission

**Old site:** Wufoo emailed the owner on submit.
**First build:** submissions are stored in `contact_submissions` and shown in the admin inbox only.

**To do:** send an email to the owner on insert. Options:
- Supabase Database Webhook → Edge Function that calls Resend/Postmark, or
- call the email API directly from the Next.js server action after insert.
Store the destination address in an env var (`CONTACT_NOTIFY_EMAIL`). Locally, Supabase's Mailpit at http://127.0.0.1:55424 can be used for testing.
