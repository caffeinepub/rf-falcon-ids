# Specification

## Summary
**Goal:** Fix admin access control, improve admin account visibility rules, and add admin account actions (ban/unban) while preserving existing admin order/account editing features.

**Planned changes:**
- Update the Admin “User Accounts” list to only show accounts after the user has placed their first order (hide profiles with zero orders).
- Fix the “Give/Grant Admin Access” control so the owner (traviscastonguay@gmail.com) can type into the email input and successfully grant admin access, with clear success/error feedback and list refresh.
- Add admin actions to Ban/Unban user accounts, persist the ban state, and enforce bans by preventing banned users from creating new orders with a clear error message.
- Ensure existing admin capabilities continue working without regression: order edits (status, tracking number, delete) and account VIP toggle, with proper loading/disabled states and readable error handling.

**User-visible outcome:** Admins can grant admin access reliably, only see accounts after a first order is placed, ban/unban users from the admin panel, and banned users are blocked from placing new orders; existing order editing and VIP toggling continue to function.
