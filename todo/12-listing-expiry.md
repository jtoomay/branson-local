# Paid-until dates and renewals

Ads were sold per year, and the old advertise page had a line to fill in the start month, day and year.

To do:
- Add `plan` and `paid_until` columns to businesses.
- Show "expiring soon" in the admin dashboard.
- Optionally run a scheduled job (pg_cron) that unpublishes expired listings or emails a renewal reminder.
