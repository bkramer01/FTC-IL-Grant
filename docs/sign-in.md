# Sign In

> **Address:** `/login` · **Last updated:** October 22, 2026

The whole site requires a login. Opening any page without being signed in brings you here.

- One shared account: username **FTCAdmin**, password from the `ADMIN_PASSWORD` setting on the server (Hostinger). There are no individual accounts.
- A wrong username or password shows "Incorrect username or password."
- After 5 wrong passwords from the same internet address, sign-in is blocked for 15 minutes ("Too many failed attempts. Please wait 15 minutes and try again.").
- A successful sign-in opens the Dashboard.
- Sessions last 12 hours, then you're asked to sign in again. **Sign out** is at the right end of the blue menu bar, next to "Signed in as FTCAdmin".
- To change the password, change `ADMIN_PASSWORD` on Hostinger and redeploy. Changing `SESSION_SECRET` signs everyone out. See [Behind the Scenes](behind-the-scenes.md#security).

## Change history

- **Oct 22, 2026:** Fuller description: messages, where sign-in leads, and how to change the password.
- **Oct 19, 2026:** Page created (mockup).
