# Specification

## Summary
**Goal:** Fix admin panel access/loading so the owner account can reliably enter /admin, and display a locked Owner email indicator in the admin UI.

**Planned changes:**
- Update the /admin route gating to handle “authenticated but backend actor/admin check unavailable” by showing an English error state with a visible Retry action (instead of infinite loading).
- Add a backend owner bootstrap/claim method that grants admin privileges only when the caller’s saved UserProfile.email matches "traviscastonguay@gmail.com", persists owner/admin status across upgrades, and writes an audit log entry on success.
- Update the admin UI to show a read-only Owner indicator displaying "traviscastonguay@gmail.com" with a lock icon and label "Owner", with no edit/remove affordances.

**User-visible outcome:** Visiting /admin no longer spins forever; users see a clear error with Retry when the admin check can’t run, the owner account can claim/admin access so the panel loads, and the admin panel shows a locked “Owner” email indicator for traviscastonguay@gmail.com.
