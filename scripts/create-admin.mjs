// Creates (or promotes) an admin user in the local Supabase instance.
// Usage: npm run admin:create                      (uses ADMIN_EMAIL / ADMIN_PASSWORD from .env.local)
//        npm run admin:create -- other@email.com pw  (explicit credentials)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const [, , argEmail, argPassword] = process.argv;
const email = argEmail ?? process.env.ADMIN_EMAIL;
const password = argPassword ?? process.env.ADMIN_PASSWORD;

if (!url || !secret || !email || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_EMAIL or ADMIN_PASSWORD.");
  process.exit(1);
}

const supabase = createClient(url, secret, { auth: { persistSession: false } });

let userId;
const { data: created, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  // Already exists → look it up and reset the password.
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) throw error;
  userId = existing.id;
  await supabase.auth.admin.updateUserById(userId, { password });
  console.log(`User ${email} already existed — password updated.`);
} else {
  userId = created.user.id;
  console.log(`Created user ${email}.`);
}

const { error: adminErr } = await supabase.from("admins").upsert({ user_id: userId });
if (adminErr) throw adminErr;
console.log(`✔ ${email} is an admin. Sign in at ${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/login`);
