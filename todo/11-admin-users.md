# Manage admins in the portal

**First build:** admins are created with `npm run admin:create`, and public sign-up is turned off.

**To do:** add an admin "Users" page that can:
- invite by email, using `auth.admin.inviteUserByEmail` in a server action with the secret key
- list current admins
- remove an admin, without letting someone remove themselves
