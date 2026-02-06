# Specification

## Summary
**Goal:** Ensure only the username "TravvyC" is treated as admin across the entire frontend auth flow, and prevent duplicate usernames during account creation.

**Planned changes:**
- Update admin detection to be derived solely from the signed-in username being exactly "TravvyC", ignoring any stored/stale `isAdmin` flags in sessions or user records.
- Apply the same admin determination consistently during sign-up, sign-in, and session restore from localStorage so existing "TravvyC" accounts gain admin automatically after the change.
- Add a unique-username check during sign-up that blocks creating an account when the exact username string already exists, showing a clear English error message.

**User-visible outcome:** Signing in as "TravvyC" shows admin access (including the Admin link and /admin access); signing in as any other username never grants admin access. Creating an account with a username that already exists is rejected with an English error.
