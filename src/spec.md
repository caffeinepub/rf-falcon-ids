# Specification

## Summary
**Goal:** Allow any authenticated admin (not just the owner) to grant and revoke admin access, and update the admin UI copy to match.

**Planned changes:**
- Update backend authorization for granting admin access so any authenticated admin can call the existing grant method (by email), while non-admin callers receive an authorization error.
- Update backend authorization for revoking admin access so any authenticated admin can call the existing revoke method (by email), while non-admin callers receive an authorization error; keep owner protection behavior as currently enforced.
- Add audit log entries for successful grant/revoke operations that include the acting admin principal and the target email.
- Update the Admin Access Management UI description text to indicate admins (not only the owner) can grant/revoke admin access, without changing existing hooks/flows.

**User-visible outcome:** Any signed-in admin can grant or revoke admin access for other users by email, and the Admin Access section text reflects this change.
