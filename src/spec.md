# Specification

## Summary
**Goal:** Fix order creation failures caused by ban-status pre-check issues, and allow any admin (not just the owner) to grant/revoke admin access.

**Planned changes:**
- Update the customer New Order flow so signed-in, non-banned users can create orders successfully and see a confirmation.
- Add/adjust backend ban-status query API so the authenticated caller can reliably check their own ban status without admin permissions, while still enforcing bans server-side during order creation.
- Change backend authorization so any authenticated admin can grant admin access by email via the existing API used by the UI, and record the action in the audit log.
- Change backend authorization so any authenticated admin can revoke admin access by email via the existing API used by the UI, prevent revoking the configured owner’s admin access, and record the action in the audit log.

**User-visible outcome:** Non-banned signed-in users can submit the New Order form without ban-check errors; banned users see a clear message that they are banned; any admin can grant or revoke admin access (except the owner) with actions recorded for auditing.
