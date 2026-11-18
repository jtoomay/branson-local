# Business owner self-service

Let a business owner claim a listing using a magic link sent to the business email, then edit their own hours, description and logo. Changes wait for admin approval before they go live.

This needs:
- an `owners` table linking user_id to business_id
- RLS policies that let owners update their own businesses
- a moderation queue in the admin
