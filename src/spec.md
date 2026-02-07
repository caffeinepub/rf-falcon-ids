# Specification

## Summary
**Goal:** Add “TREY C SECURITY” anti-abuse protections to state-mutating backend calls and expand the admin panel with security monitoring and higher-value management tools.

**Planned changes:**
- Implement a TREY C SECURITY backend protection layer that rate-limits protected state-mutating update methods per-caller (Principal), with configurable thresholds and clear TREY C SECURITY error messaging when limits are exceeded.
- Add admin-managed allowlist/blocklist controls for Principals that deny blocked callers from protected endpoints, without weakening existing admin-only authorization.
- Persist security configuration, counters, and lists across upgrades using stable storage (including migration updates only if needed).
- Add admin-only TREY C SECURITY observability endpoints for aggregated counters, recent security events (timestamp, caller Principal, method/action, decision, reason), and current configuration summary.
- Add admin-only TREY C SECURITY administrative endpoints to enable/disable protections, tune rate-limit thresholds, clear/reset counters, and manage allowlist/blocklist entries, with admin actions recorded to an audit trail.
- Upgrade the existing AdminPanelPage with a dedicated “TREY C SECURITY” section (tab/section) showing KPIs, recent-events list/table, allowlist/blocklist management, and configuration controls, wired via React Query hooks with toasts and query refetch/invalidation.
- Enhance admin order management with bulk order actions (approve/ship/delete) including confirmations and per-action outcomes, and add CSV export for the currently filtered orders.
- Add a backend admin audit log for critical admin actions (e.g., resets, deletes, security config changes) and a corresponding admin UI view to browse/filter recent entries.

**User-visible outcome:** Admins get a new “TREY C SECURITY” area in the admin panel to monitor and tune anti-abuse protections (including event history and allow/block lists), plus bulk order tools, CSV export, and an audit log view; abusive callers are throttled/blocked on protected state-changing operations.
